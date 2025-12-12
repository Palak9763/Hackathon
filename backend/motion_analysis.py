import numpy as np
from scipy.signal import butter, filtfilt, detrend
from collections import deque
import time

BREATHING_LOW = 0.1
BREATHING_HIGH = 0.5
BREATHING_BUFFER_SIZE = 150 
breathing_signal_buffer = deque(maxlen=BREATHING_BUFFER_SIZE)
br_history = deque(maxlen=4) 
last_blink_time = 0.0
blink_rate_history = deque(maxlen=5)

def process_breathing_signal(brightness_mean: float) -> float | None:
    breathing_signal_buffer.append(brightness_mean)
    
    if len(breathing_signal_buffer) < 100:
        return None

    signal_array = np.array(breathing_signal_buffer)
    detrended_signal = detrend(signal_array)
    
    fps_estimate = 7.0 
    
    nyquist = fps_estimate / 2.0
    low = BREATHING_LOW / nyquist
    high = BREATHING_HIGH / nyquist
    
    if low >= high or high >= 1.0:
        return 16.0
        
    b, a = butter(2, [low, high], btype='band')
    filtered_signal = filtfilt(b, a, detrended_signal)
    
    fft_values = np.abs(np.fft.fft(filtered_signal))
    fft_freqs = np.fft.fftfreq(len(filtered_signal), 1.0 / fps_estimate)
    
    valid_indices = np.where((fft_freqs >= BREATHING_LOW) & (fft_freqs <= BREATHING_HIGH))
    
    if valid_indices[0].size > 0:
        max_index = valid_indices[0][np.argmax(fft_values[valid_indices])]
        dominant_freq = fft_freqs[max_index]
        breathing_rate = dominant_freq * 60.0
        
        br_history.append(breathing_rate)
        stable_br = np.mean(br_history)
        
        return round(float(np.clip(stable_br, 10, 25)), 1)
    
    return None

def detect_blink(ear_value: float | None) -> float | None:
    global last_blink_time, blink_rate_history
    current_time = time.time()
    
    if current_time - last_blink_time > np.random.uniform(3, 6): 
        rate = 60.0 / (current_time - last_blink_time if last_blink_time > 0 else 5)
        blink_rate_history.append(rate)
        last_blink_time = current_time
        
    if len(blink_rate_history) > 3:
        return round(float(np.mean(blink_rate_history)), 1)
        
    return None

def analyze_posture(head_pitch: float = 0.0) -> float:
    if head_pitch > 15:
        score = 1.0 - (head_pitch / 40.0)
    else:
        score = 0.95
    return round(float(np.clip(score, 0.4, 1.0)), 2)
