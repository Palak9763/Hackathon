import numpy as np
from scipy.signal import butter, filtfilt, detrend, welch
from collections import deque
import time

BUFFER_SIZE = 70
FPS_TARGET = 7.0
BANDPASS_LOW = 0.7
BANDPASS_HIGH = 4.0
BANDPASS_ORDER = 3
HR_SMOOTHING_WINDOW = 3

class RPPGProcessor:
    def __init__(self):
        self.signal_buffer = deque(maxlen=BUFFER_SIZE) 
        self.timestamps = deque(maxlen=BUFFER_SIZE)
        self.hr_history = deque(maxlen=HR_SMOOTHING_WINDOW) 

    def process_frame(self, green_mean: float) -> dict:
        self.signal_buffer.append(green_mean)
        self.timestamps.append(time.time())

        if len(self.signal_buffer) < int(2.5 * FPS_TARGET): 
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
            confidence = 0.8

        f, Pxx = welch(filtered_signal, fs=fps_estimate, nperseg=min(len(filtered_signal), 60))
        
        valid_indices = np.where((f >= BANDPASS_LOW) & (f <= BANDPASS_HIGH))
        
        if valid_indices[0].size > 0:
            max_index = valid_indices[0][np.argmax(Pxx[valid_indices])]
            dominant_freq = f[max_index]
            heart_rate = dominant_freq * 60.0

            total_power = np.sum(Pxx[valid_indices])
            peak_power = Pxx[max_index]
            
            hr_to_smooth = heart_rate if (peak_power / total_power) >= 0.2 else None
            confidence = 0.9 if hr_to_smooth else 0.5

            if hr_to_smooth is not None:
                self.hr_history.append(hr_to_smooth)
            
            stable_hr = np.mean(self.hr_history) if self.hr_history else None
                
            if stable_hr is not None:
                hr_dev = abs(stable_hr - 75) / 30.0
                stress_estimate = 0.3 + (hr_dev * 0.5) 
                stress_estimate = np.clip(stress_estimate, 0.2, 0.9)
            else:
                stress_estimate = 0.5
            
            return {
                "heart_rate": round(float(stable_hr), 1) if stable_hr else None,
                "stress_level": round(float(stress_estimate), 2),
                "confidence": confidence
            }
        
        return {"heart_rate": None, "stress_level": 0.5, "confidence": 0.4}

rppg_engine = RPPGProcessor()
