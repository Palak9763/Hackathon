import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function FeverHelp() {
  const [symptoms, setSymptoms] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const symptomOptions = [
    'Fever',
    'Headache',
    'Body aches',
    'Fatigue',
    'Cough',
    'Sore throat',
    'Runny nose',
    'Chills'
  ];

  const toggleSymptom = (symptom) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const getSuggestions = async () => {
    if (symptoms.length === 0) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/fever_medicine', {
        symptoms: symptoms,
        lang: 'en'
      });
      setSuggestions(response.data);
    } catch (err) {
      console.error('Error getting suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-center mb-8"
      >
        Fever & Symptom Help
      </motion.h1>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Your Symptoms</h2>
        <div className="flex flex-wrap gap-3">
          {symptomOptions.map((symptom) => (
            <button
              key={symptom}
              onClick={() => toggleSymptom(symptom)}
              className={`px-4 py-2 rounded-full transition-colors ${
                symptoms.includes(symptom)
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
        
        <button
          onClick={getSuggestions}
          disabled={symptoms.length === 0 || loading}
          className="btn-primary mt-6 w-full disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Suggestions'}
        </button>
      </div>

      {suggestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="card border-l-4 border-green-500">
            <h3 className="text-lg font-semibold mb-2 text-green-600">OTC Medications</h3>
            <p className="text-gray-600 dark:text-gray-300">{suggestions.otc_meds}</p>
          </div>
          
          <div className="card border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-2 text-blue-600">Home Remedies</h3>
            <p className="text-gray-600 dark:text-gray-300">{suggestions.home_remedies}</p>
          </div>
          
          <div className="card border-l-4 border-red-500">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Warnings</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
              {suggestions.warnings?.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-center text-sm text-yellow-800 dark:text-yellow-200">
            {suggestions.disclaimer}
          </div>
        </motion.div>
      )}
    </div>
  );
}
