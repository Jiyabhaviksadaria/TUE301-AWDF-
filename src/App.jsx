import { lazy, Suspense, useEffect, useState } from 'react';
import { NavLink, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import './styles/App.css';
import { authService } from './services/authService';

// Lazy loading route-based components with React.lazy()
const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const Contact = lazy(() => import('./pages/Contact'));
const Tasks = lazy(() => import('./pages/Tasks'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/Login'));

// Meaningful Fallback UI for Suspense during lazy chunk loading
function PageLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        background: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
        borderRadius: '16px',
        border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
        margin: '30px auto',
        maxWidth: '480px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          border: '4px solid rgba(59, 130, 246, 0.2)',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px',
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ margin: 0, fontWeight: 600, color: 'var(--text, #e2e8f0)', fontSize: '0.95rem' }}>
        Loading page module...
      </p>
      <span style={{ fontSize: '0.8rem', color: 'var(--muted, #94a3b8)', marginTop: '4px' }}>
        ⚡ React.lazy() & Suspense Chunk Optimization
      </span>
    </div>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return (
      Boolean(authService.getToken()) ||
      localStorage.getItem('awdf_is_authenticated') === 'true'
    );
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

  // Validate JWT Token on app mount via GET /me
  useEffect(() => {
    const verifySession = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const userObj = await authService.getMe();
          if (userObj && userObj.email) {
            setCurrentUser(userObj.email);
            setIsAuthenticated(true);
            localStorage.setItem('awdf_is_authenticated', 'true');
            localStorage.setItem('awdf_user', userObj.email);
          }
        } catch (err) {
          console.warn('Session verification failed or token expired:', err.message);
          handleLogout();
        }
      }
    };

    verifySession();
  }, []);

  const handleLogin = (username, password, isJwt = false) => {
    if (isJwt) {
      const storedUser = localStorage.getItem('awdf_user') || username;
      setCurrentUser(storedUser);
      setIsAuthenticated(true);
      navigate('/');
      return true;
    }

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
    authService.removeToken();
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
        <Suspense fallback={<PageLoadingFallback />}>
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
        </Suspense>
      </main>
    </div>
  );
}

export default App;