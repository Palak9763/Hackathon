import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('/api/history/scans?limit=20');
        const formattedData = response.data.map((item, index) => ({
          ...item,
          time: new Date(item.timestamp).toLocaleTimeString(),
          index: index
        }));
        setHistory(formattedData.reverse());
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  const getAverages = () => {
    if (history.length === 0) return { hr: 0, br: 0, stress: 0 };
    
    const validHr = history.filter(h => h.heart_rate);
    const validBr = history.filter(h => h.breathing_rate);
    
    return {
      hr: validHr.length ? Math.round(validHr.reduce((a, b) => a + b.heart_rate, 0) / validHr.length) : 0,
      br: validBr.length ? Math.round(validBr.reduce((a, b) => a + b.breathing_rate, 0) / validBr.length * 10) / 10 : 0,
      stress: Math.round(history.reduce((a, b) => a + (b.stress_level || 0), 0) / history.length * 100)
    };
  };

  const averages = getAverages();

  return (
    <div className="max-w-6xl mx-auto">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-center mb-8"
      >
        Health Dashboard
      </motion.h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Avg Heart Rate</div>
          <div className="text-4xl font-bold text-red-500">{averages.hr || '--'}</div>
          <div className="text-sm text-gray-500">BPM</div>
        </div>
        <div className="card text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Avg Breathing</div>
          <div className="text-4xl font-bold text-blue-500">{averages.br || '--'}</div>
          <div className="text-sm text-gray-500">/min</div>
        </div>
        <div className="card text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Avg Stress</div>
          <div className="text-4xl font-bold text-amber-500">{averages.stress}%</div>
          <div className="text-sm text-gray-500">level</div>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="text-gray-500">Loading history...</div>
        </div>
      ) : history.length > 0 ? (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Heart Rate Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[40, 120]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="heart_rate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
                name="Heart Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">&#128202;</div>
          <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
          <p className="text-gray-500">Start a health scan to begin tracking your vitals</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Scans</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b dark:border-gray-700">
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Heart Rate</th>
                  <th className="pb-3">Breathing</th>
                  <th className="pb-3">Stress</th>
                  <th className="pb-3">Emotion</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(-10).reverse().map((scan, idx) => (
                  <tr key={idx} className="border-b dark:border-gray-700 last:border-0">
                    <td className="py-3">{scan.time}</td>
                    <td className="py-3 text-red-500">{scan.heart_rate || '--'} BPM</td>
                    <td className="py-3 text-blue-500">{scan.breathing_rate || '--'}/min</td>
                    <td className="py-3">{Math.round((scan.stress_level || 0) * 100)}%</td>
                    <td className="py-3 capitalize">{scan.emotion || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
