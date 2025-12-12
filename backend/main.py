from fastapi import FastAPI, Depends, WebSocket, Request
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pathlib import Path
import json

from .database import init_db, get_db
from .models import HealthLog, ContactMessage
from .websocket_handler import websocket_endpoint
from .fever_suggestions import get_fever_suggestions

app = FastAPI(title="AI-Health Vision PRO", version="Replit Edition")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BUILD_DIR = Path("frontend/dist")
if BUILD_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=BUILD_DIR / "assets"), name="assets")

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/", response_class=HTMLResponse)
@app.get("/scan", response_class=HTMLResponse)
@app.get("/dashboard", response_class=HTMLResponse)
@app.get("/fever-help", response_class=HTMLResponse)
@app.get("/info", response_class=HTMLResponse)
@app.get("/contact", response_class=HTMLResponse)
async def serve_frontend():
    if (BUILD_DIR / "index.html").exists():
        return FileResponse(BUILD_DIR / "index.html")
    return HTMLResponse("<h1>Frontend Not Built</h1><p>Run npm run build in frontend directory</p>", status_code=500)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "API Operational."}

@app.websocket("/ws/scan")
async def live_scan_websocket(websocket: WebSocket):
    await websocket_endpoint(websocket)

@app.post("/api/fever_medicine")
async def fever_medicine_suggestion(request: Request):
    try:
        data = await request.json()
        symptoms = data.get("symptoms", [])
        lang = data.get("lang", "en")
        return get_fever_suggestions(symptoms, lang)
    except json.JSONDecodeError:
        return JSONResponse({"status": "error", "message": "Invalid JSON"}, status_code=400)

@app.post("/api/contact")
async def submit_contact(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        msg = ContactMessage(
            name=data.get("name", "Anon"), 
            email=data.get("email", ""), 
            message=data.get("message", "")
        )
        db.add(msg)
        db.commit()
        return {"status": "success", "message": "Message received."}
    except Exception:
        return JSONResponse({"status": "error", "message": "Failed to save message"}, status_code=500)

@app.get("/api/history/scans")
def get_scan_history(db: Session = Depends(get_db), limit: int = 10):
    scans = db.query(HealthLog).order_by(HealthLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "timestamp": log.timestamp.isoformat(), 
            "heart_rate": log.heart_rate, 
            "stress_level": log.stress_level,
            "emotion": log.emotion,
            "breathing_rate": log.breathing_rate,
            "blink_rate": log.blink_rate,
            "posture_score": log.posture_score
        }
        for log in scans
    ]
