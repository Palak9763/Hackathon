# AI-Health Vision PRO

## Overview
A real-time AI-powered health monitoring web application using rPPG (remote photoplethysmography) technology to measure vital signs from webcam video.

## Current State
- **Status**: MVP Complete
- **Last Updated**: December 12, 2025

## Features
- Real-time webcam video streaming with WebSocket
- Heart rate detection using CHROM algorithm with FFT (42-240 BPM)
- Breathing rate analysis (6-30 breaths/min)
- Stress level estimation based on HRV patterns
- Blink rate and posture score analysis
- Health metrics dashboard with historical data
- Fever/symptom help page
- Contact form with database storage

## Tech Stack

### Backend (Python)
- FastAPI with Uvicorn
- SQLAlchemy with SQLite
- NumPy & SciPy for signal processing
- OpenCV for image processing

### Frontend
- React 18 with React Router
- Vite for build tooling
- Tailwind CSS for styling
- Recharts for data visualization
- Framer Motion for animations

## Project Structure
```
/
├── backend/
│   ├── __init__.py
│   ├── main.py           # FastAPI entry point
│   ├── database.py       # SQLite configuration
│   ├── models.py         # SQLAlchemy models
│   ├── rppg_processor.py # Heart rate signal processing
│   ├── motion_analysis.py # Breathing & posture analysis
│   ├── websocket_handler.py # WebSocket endpoint
│   └── fever_suggestions.py # Symptom suggestions
├── frontend/
│   ├── src/
│   │   ├── pages/        # React page components
│   │   ├── components/   # Shared components
│   │   └── App.jsx       # Main routing
│   ├── dist/             # Built production files
│   └── package.json
└── requirements.txt
```

## Running the Application
The application runs on port 5000:
- Frontend served at `/`
- API endpoints at `/api/*`
- WebSocket at `/ws/scan`

## API Endpoints
- `GET /api/health` - Health check
- `GET /api/history/scans` - Get scan history
- `POST /api/fever_medicine` - Get fever suggestions
- `POST /api/contact` - Submit contact form
- `WS /ws/scan` - Real-time video processing

## User Preferences
- None recorded yet

## Recent Changes
- Initial MVP implementation complete
