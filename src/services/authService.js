const API_BASE = 'http://localhost:5000';
const TOKEN_KEY = 'awdf_jwt_token';

export const authService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),

  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('awdf_is_authenticated');
    localStorage.removeItem('awdf_user');
  },

  register: async (email, password) => {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid credentials');
    }

    if (data.token) {
      authService.setToken(data.token);
      localStorage.setItem('awdf_is_authenticated', 'true');
      localStorage.setItem('awdf_user', data.user?.email || email);
    }
    return data;
  },

  getMe: async () => {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const res = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        authService.removeToken();
      }
      throw new Error(data.message || 'Failed to fetch profile');
    }
    return data;
  },
};
