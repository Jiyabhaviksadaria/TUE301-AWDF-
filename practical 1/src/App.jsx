import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Projects from './components/Projects';
import Contact from './components/Contact';
import NotFound from './components/NotFound';
import Footer from './components/Footer';
import './App.css';

function App() {
  // Theme Color Prop Demo state (governs the inline highlights in Header)
  const [themeColor, setThemeColor] = useState('#6366f1');
  
  // Dark/Light Mode state
  const [isLightTheme, setIsLightTheme] = useState(false);

  const studentName = "Jiya Sadaria";
  
  const skillList = [
    "React.js",
    "JavaScript (ES6+)",
    "HTML5 & CSS3",
    "Git & GitHub",
    "Vite & npm",
    "Responsive Design",
    "Component Architecture",
    "RESTful APIs"
  ];

  const projectList = [
    {
      title: "Interactive Student Portfolio",
      description: "A premium glassmorphism-based portfolio website showcasing React modular components, parent-child props routing, and sticky navbar scroll highlights.",
      tech: ["React", "Vite", "CSS Custom Variables"]
    },
    {
      title: "Task Management Web App",
      description: "A responsive productivity portal allowing students to manage lab schedules, add sub-tasks, and track project milestones with local storage persistence.",
      tech: ["React", "State Management", "Flexbox/Grid"]
    },
    {
      title: "Algorithmic Sorting Visualizer",
      description: "An educational web tool designed to visually demonstrate sorting algorithms like Bubble, Quick, and Merge sort in real-time.",
      tech: ["JavaScript", "HTML Canvas", "CSS Animations"]
    }
  ];

  const themes = [
    { name: 'Indigo (Default)', color: '#6366f1' },
    { name: 'Violet Glow', color: '#a855f7' },
    { name: 'Cyan Wave', color: '#06b6d4' },
    { name: 'Emerald Spark', color: '#10b981' }
  ];

  // Effect to toggle the root body CSS class for dark/light mode
  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [isLightTheme]);

  return (
    <div className="app-container">
      {/* Navigation - handles light/dark state toggle */}
      <NavBar isLightTheme={isLightTheme} setIsLightTheme={setIsLightTheme} />
      
      {/* Route Switchboard */}
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                name={studentName} 
                themeColor={themeColor} 
                skillList={skillList} 
              />
            } 
          />
          <Route 
            path="/projects" 
            element={<Projects projects={projectList} />} 
          />
          <Route 
            path="/contact" 
            element={<Contact />} 
          />
          {/* 404 Route */}
          <Route 
            path="*" 
            element={<NotFound />} 
          />
        </Routes>
      </main>

      {/* Interactive Theme Color Control (Still present to showcase component re-rendering on prop updates) */}
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          background: isLightTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(17, 23, 38, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--glass-border)',
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '0.8rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>
          Interactive Prop Demo:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {themes.map(t => (
            <button
              key={t.color}
              onClick={() => setThemeColor(t.color)}
              style={{
                background: themeColor === t.color ? t.color : 'rgba(255,255,255,0.05)',
                border: 'none',
                color: themeColor === t.color ? '#fff' : 'var(--text-primary)',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                fontSize: '0.75rem',
                boxShadow: themeColor === t.color ? `0 2px 8px ${t.color}40` : 'none'
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Footer is persistent across all paths */}
      <Footer />
    </div>
  );
}

export default App;
