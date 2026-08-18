import { useState } from 'react';

function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function Login({ onLogin, onGoogleLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const success = onLogin(username.trim(), password);
      setIsLoading(false);

      if (!success) {
        setError('Invalid username or password! (Hint: username=jiya, password=24AIML054)');
      }
    }, 400);
  };

  const googleAccounts = [
    { name: 'Jiya Sadaria', email: 'jiyasadaria@gmail.com', avatar: 'J' },
    { name: 'Jiya Sadaria (AIML Student)', email: '24aiml054@student.ac.in', avatar: 'S' },
  ];

  const handleSelectGoogleAccount = (account) => {
    setShowGoogleModal(false);
    onGoogleLogin(account);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-badge">🔒 Authentication</div>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Please sign in to access Student Portfolio & Task Manager</p>
        </div>

        {error && (
          <div className="login-error-alert" role="alert">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          className="google-btn"
          onClick={() => setShowGoogleModal(true)}
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        <div className="divider-or">
          <span>OR</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              placeholder="Enter username (e.g. jiya)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer-hint">
          <span>Required Credentials:</span>
          <code>Username: jiya | Password: 24AIML054</code>
        </div>
      </div>

      {showGoogleModal && (
        <div className="modal-overlay" onClick={() => setShowGoogleModal(false)}>
          <div className="google-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="google-modal-header">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleIcon />
              </div>
              <h3 className="google-modal-title" style={{ marginTop: '12px' }}>Choose an Account</h3>
              <p className="google-modal-subtitle">to continue to Student Portfolio</p>
            </div>

            <div className="google-account-list">
              {googleAccounts.map((account) => (
                <div
                  key={account.email}
                  className="google-account-item"
                  onClick={() => handleSelectGoogleAccount(account)}
                >
                  <div className="google-avatar">{account.avatar}</div>
                  <div className="google-account-info">
                    <span className="google-account-name">{account.name}</span>
                    <span className="google-account-email">{account.email}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="form-button"
              style={{ width: '100%', background: 'transparent' }}
              onClick={() => setShowGoogleModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
