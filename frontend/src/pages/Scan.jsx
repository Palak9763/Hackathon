import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function Scan() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [metrics, setMetrics] = useState({
    heart_rate: null,
    breathing_rate: null,
    stress_level: 0.5,
    emotion: 'neutral',
    blink_rate: null,
    posture_score: 0.95,
    confidence: 0
  });
  const [error, setError] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const connectWebSocket = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/scan`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === 'ok') {
        setMetrics(data);
      }
    };
    
    wsRef.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket closed');
    };
  }, []);

  const sendFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !wsRef.current) return;
    if (wsRef.current.readyState !== WebSocket.OPEN) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 320;
    canvas.height = 240;
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
    
    const frame = canvas.toDataURL('image/jpeg', 0.5);
    wsRef.current.send(JSON.stringify({
      frame: frame,
      ts: Date.now(),
      head_pitch: 0
    }));
  }, []);

  useEffect(() => {
    let intervalId;
    if (isScanning) {
      connectWebSocket();
      intervalId = setInterval(sendFrame, 143); // ~7 FPS
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (wsRef.current) wsRef.current.close();
    };
  }, [isScanning, connectWebSocket, sendFrame]);

  const toggleScanning = async () => {
    if (!isScanning) {
      await startCamera();
      setIsScanning(true);
    } else {
      setIsScanning(false);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  };

  const getStressColor = (level) => {
    if (level < 0.3) return 'text-green-500';
    if (level < 0.7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = { happy: '&#128522;', neutral: '&#128528;', stressed: '&#128544;' };
    return emojis[emotion] || '&#128528;';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-center mb-8"
      >
        Real-Time Health Scan
      </motion.h1>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-xl bg-gray-900"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {isScanning && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                <div className="live-indicator">
                  <span></span>
                  <span className="dot"></span>
                </div>
                <span className="text-white text-sm">LIVE</span>
              </div>
            )}
          </div>
          
          <button
            onClick={toggleScanning}
            className={`w-full mt-4 py-3 rounded-xl font-semibold transition-colors ${
              isScanning
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'btn-primary'
            }`}
          >
            {isScanning ? 'Stop Scan' : 'Start Scan'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-500 dark:text-gray-400">
              Live Metrics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl">
                <div className="text-sm text-gray-500 dark:text-gray-400">Heart Rate</div>
                <div className="text-3xl font-bold text-red-500">
                  {metrics.heart_rate ? `${metrics.heart_rate}` : '--'}
                  <span className="text-lg ml-1">BPM</span>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                <div className="text-sm text-gray-500 dark:text-gray-400">Breathing</div>
                <div className="text-3xl font-bold text-blue-500">
                  {metrics.breathing_rate ? `${metrics.breathing_rate}` : '--'}
                  <span className="text-lg ml-1">/min</span>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
                <div className="text-sm text-gray-500 dark:text-gray-400">Stress Level</div>
                <div className={`text-3xl font-bold ${getStressColor(metrics.stress_level)}`}>
                  {Math.round(metrics.stress_level * 100)}%
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl">
                <div className="text-sm text-gray-500 dark:text-gray-400">Emotion</div>
                <div className="text-3xl font-bold text-purple-500 flex items-center gap-2">
                  <span dangerouslySetInnerHTML={{ __html: getEmotionEmoji(metrics.emotion) }} />
                  <span className="text-lg capitalize">{metrics.emotion}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-500 dark:text-gray-400">
              Additional Metrics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="text-sm text-gray-500 dark:text-gray-400">Blink Rate</div>
                <div className="text-2xl font-bold">
                  {metrics.blink_rate ? `${metrics.blink_rate}/min` : '--'}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="text-sm text-gray-500 dark:text-gray-400">Posture</div>
                <div className="text-2xl font-bold">
                  {Math.round(metrics.posture_score * 100)}%
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">Signal Confidence</div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${metrics.confidence * 100}%` }}
              />
            </div>
            <div className="text-right text-sm mt-1 text-gray-500">
              {Math.round(metrics.confidence * 100)}%
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-center text-sm text-yellow-800 dark:text-yellow-200">
        This is NOT a medical device. For informational purposes only. Consult a healthcare professional for medical advice.
      </div>
    </div>
  );
}
