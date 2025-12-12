import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Scan from './pages/Scan.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FeverHelp from './pages/FeverHelp.jsx';
import Info from './pages/Info.jsx';
import Contact from './pages/Contact.jsx';
import Nav from './components/Nav.jsx';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen dark:bg-gray-900">
        <Nav />
        <main className="container mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fever-help" element={<FeverHelp />} />
            <Route path="/info" element={<Info />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
