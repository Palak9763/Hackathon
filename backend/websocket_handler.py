from fastapi import WebSocket
import json
import numpy as np
import cv2
import base64
import time
from datetime import datetime
from .rppg_processor import rppg_engine
from .motion_analysis import process_breathing_signal, detect_blink, analyze_posture
from .database import get_db
from .models import HealthLog

def decode_base64_image(base64_string: str) -> np.ndarray | None:
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    try:
        image_data = base64.b64decode(base64_string)
        image = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(image, cv2.IMREAD_COLOR)
        return frame
    except Exception:
        return None

async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    db_gen = get_db()
    db = next(db_gen) 
    last_db_save = 0
    DB_SAVE_INTERVAL = 10 

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            frame_b64 = payload.get("frame")
            
            if not frame_b64: continue

            frame = decode_base64_image(frame_b64)
            if frame is None:
                await websocket.send_text(json.dumps({"status": "error", "message": "Failed to decode frame."}))
                continue
            
            h, w, _ = frame.shape
            w_roi, h_roi = w // 3, h // 3
            x_roi, y_roi = (w - w_roi) // 2, (h - h_roi) // 2
            face_roi = frame[y_roi:y_roi+h_roi, x_roi:x_roi+w_roi]

            if face_roi.size == 0:
                metrics = {"status": "error", "message": "No stable face ROI"}
            else:
                green_mean = np.mean(face_roi[:, :, 1])
                brightness_mean = np.mean(cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY))
                
                rppg_result = rppg_engine.process_frame(green_mean)
                hr = rppg_result.get("heart_rate")
                
                br = process_breathing_signal(brightness_mean)
                blink_r = detect_blink(None) 
                posture_s = analyze_posture(payload.get("head_pitch", 0.0))
                
                stress_lvl = rppg_result.get("stress_level", 0.5)
                emotion = "stressed" if stress_lvl > 0.7 else "happy" if stress_lvl < 0.3 else "neutral"

                metrics = {
                    "status": "ok",
                    "heart_rate": hr,
                    "stress_level": stress_lvl,
                    "emotion": emotion,
                    "breathing_rate": br,
                    "blink_rate": blink_r,
                    "posture_score": posture_s,
                    "confidence": rppg_result.get("confidence", 0.0)
                }
            
            await websocket.send_text(json.dumps(metrics))
            
            if time.time() - last_db_save > DB_SAVE_INTERVAL and hr is not None:
                log = HealthLog(
                    heart_rate=hr,
                    stress_level=stress_lvl,
                    emotion=emotion,
                    breathing_rate=br,
                    posture_score=posture_s,
                    blink_rate=blink_r,
                    timestamp=datetime.utcnow()
                )
                db.add(log)
                db.commit()
                last_db_save = time.time()

    except Exception:
        db.close()
