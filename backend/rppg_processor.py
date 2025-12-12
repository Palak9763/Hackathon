import numpy as np
from scipy.signal import butter, filtfilt, detrend
from collections import deque
import time

BUFFER_SIZE = 150
FPS_TARGET = 7.0
BANDPASS_LOW = 0.7
BANDPASS_HIGH = 4.0
BANDPASS_ORDER = 3

class RPPGProcessor:
    def __init__(self):
        self.signal_buffer = deque(maxlen=BUFFER_SIZE) 
        self.timestamps = deque(maxlen=BUFFER_SIZE)

    def process_frame(self, green_mean: float) -> dict:
        self.signal_buffer.append(green_mean)
        self.timestamps.append(time.time())

        if len(self.signal_buffer) < int(1.5 * FPS_TARGET): 
            return {"heart_rate": None, "stress_level": 0.5, "confidence": 0.0}

        if len(self.timestamps) > 1:
            fps_estimate = 1.0 / np.mean(np.diff(np.array(self.timestamps)))
        else:
            fps_estimate = FPS_TARGET
        
        signal_array = np.array(self.signal_buffer)
        detrended_signal = detrend(signal_array)
        
        nyquist = fps_estimate / 2.0
        low = BANDPASS_LOW / nyquist
        high = BANDPASS_HIGH / nyquist
        
        if low >= high or high >= 1.0:
            filtered_signal = detrended_signal
            confidence = 0.3
        else:
            b, a = butter(BANDPASS_ORDER, [low, high], btype='band')
            filtered_signal = filtfilt(b, a, detrended_signal)
            confidence = 0.7

        fft_values = np.abs(np.fft.fft(filtered_signal))
        fft_freqs = np.fft.fftfreq(len(filtered_signal), 1.0 / fps_estimate)
        
        valid_indices = np.where((fft_freqs >= BANDPASS_LOW) & (fft_freqs <= BANDPASS_HIGH))
        
        if valid_indices[0].size > 0:
            max_index = valid_indices[0][np.argmax(fft_values[valid_indices])]
            dominant_freq = fft_freqs[max_index]
            heart_rate = dominant_freq * 60.0
            
            hr_dev = abs(heart_rate - 75) / 30.0
            stress_estimate = 0.3 + (hr_dev * 0.5) 
            stress_estimate = np.clip(stress_estimate, 0.2, 0.9)
            
            return {
                "heart_rate": round(float(heart_rate), 1),
                "stress_level": round(float(stress_estimate), 2),
                "confidence": confidence
            }
        
        return {"heart_rate": None, "stress_level": 0.5, "confidence": 0.0}

rppg_engine = RPPGProcessor()
