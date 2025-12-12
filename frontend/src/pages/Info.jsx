import React from 'react';
import { motion } from 'framer-motion';

export default function Info() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-center mb-8"
      >
        How It Works
      </motion.h1>

      <div className="space-y-6">
        <div className="card border-l-4 border-cyan-500">
          <h2 className="text-2xl font-semibold mb-4">What is rPPG?</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Remote Photoplethysmography (rPPG) is a non-contact technique that uses standard cameras 
            to detect subtle color changes in the skin caused by blood flow. These color variations, 
            invisible to the naked eye, contain information about your heart rate and other vital signs.
          </p>
        </div>

        <div className="card border-l-4 border-blue-500">
          <h2 className="text-2xl font-semibold mb-4">The Technology</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. Signal Capture</h3>
              <p>Your webcam captures video frames, and we extract the green channel intensity from your face region.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">2. Signal Processing</h3>
              <p>We apply Butterworth bandpass filtering (0.7-4.0 Hz) and detrending to isolate the cardiac signal.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">3. FFT Analysis</h3>
              <p>Fast Fourier Transform identifies the dominant frequency, which corresponds to your heart rate.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">4. Metric Calculation</h3>
              <p>Additional metrics like breathing rate and stress levels are derived from the processed signals.</p>
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-green-500">
          <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Ensure good, consistent lighting on your face</li>
            <li>Keep your face centered in the camera frame</li>
            <li>Minimize movement during scanning</li>
            <li>Avoid direct sunlight or harsh shadows</li>
            <li>Wait 10-15 seconds for stable readings</li>
          </ul>
        </div>

        <div className="card border-l-4 border-amber-500">
          <h2 className="text-2xl font-semibold mb-4">Limitations</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This application provides estimations based on video analysis and should not be used for 
            medical diagnosis. Accuracy depends on:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Lighting conditions</li>
            <li>Camera quality</li>
            <li>User movement</li>
            <li>Skin tone variations</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-center text-red-800 dark:text-red-200">
        <strong>Medical Disclaimer:</strong> This is NOT a medical device. 
        Always consult healthcare professionals for medical advice and diagnosis.
      </div>
    </div>
  );
}
