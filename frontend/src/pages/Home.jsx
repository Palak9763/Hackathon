import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
          AI-Health Vision PRO
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
          Real-time health monitoring using advanced rPPG technology. 
          Measure your heart rate, breathing, and stress levels using just your webcam.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/scan" className="btn-primary text-lg">
            Start Health Scan
          </Link>
          <Link to="/info" className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Learn More
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="card">
            <div className="text-4xl mb-4">&#10084;&#65039;</div>
            <h3 className="text-xl font-semibold mb-2">Heart Rate</h3>
            <p className="text-gray-600 dark:text-gray-400">Real-time BPM measurement using rPPG signal processing</p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">&#128168;</div>
            <h3 className="text-xl font-semibold mb-2">Breathing Rate</h3>
            <p className="text-gray-600 dark:text-gray-400">Monitor your respiration through subtle motion analysis</p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">&#128161;</div>
            <h3 className="text-xl font-semibold mb-2">Stress Level</h3>
            <p className="text-gray-600 dark:text-gray-400">AI-powered stress estimation based on HRV patterns</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
