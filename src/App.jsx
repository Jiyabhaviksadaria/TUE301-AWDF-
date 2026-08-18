import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import './styles/App.css';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Tasks from './pages/Tasks';
import NotFound from './pages/NotFound';
import Login from './pages/Login';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('awdf_is_authenticated') === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('awdf_user') || 'jiya';
  });

  const navigate = useNavigate();

  useEffect(() => {
    const rootElement = document.documentElement;
    rootElement.classList.toggle('theme-dark', isDarkMode);
    rootElement.classList.toggle('theme-light', !isDarkMode);
  }, [isDarkMode]);

  const handleLogin = (username, password) => {
    if (username === 'jiya' && password === '24AIML054') {
      localStorage.setItem('awdf_is_authenticated', 'true');
      localStorage.setItem('awdf_user', username);
      setCurrentUser(username);
      setIsAuthenticated(true);
      navigate('/');
      return true;
    }
    return false;
  };

  const handleGoogleLogin = (googleAccount) => {
    const userName = googleAccount?.name || 'Jiya Sadaria';
    localStorage.setItem('awdf_is_authenticated', 'true');
    localStorage.setItem('awdf_user', userName);
    setCurrentUser(userName);
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('awdf_is_authenticated');
    localStorage.removeItem('awdf_user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Student Portfolio</p>
          <h1 className="site-title">Jiya Sadaria</h1>
        </div>

        {isAuthenticated && (
          <nav className="nav-links" aria-label="Primary navigation">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/projects">Projects</NavLink>
            <NavLink to="/tasks">Tasks</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setIsDarkMode((currentValue) => !currentValue)}
          >
            {isDarkMode ? 'Light mode' : 'Dark mode'}
          </button>

          {isAuthenticated && (
            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
              title="Logout session"
            >
              Logout ({currentUser})
            </button>
          )}
        </div>
      </header>

      <main className="page-content">
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />
              )
            }
          />
          <Route
            path="/"
            element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/projects"
            element={
              isAuthenticated ? (
                <Navigate to="/projects/Jiyabhaviksadaria" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/projects/:username"
            element={isAuthenticated ? <Projects /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/tasks"
            element={isAuthenticated ? <Tasks /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/contact"
            element={isAuthenticated ? <Contact /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;