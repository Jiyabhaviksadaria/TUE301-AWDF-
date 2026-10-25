import { authService } from './authService';

const API_URL = 'http://localhost:5000/tasks';
const LOCAL_STORAGE_KEY = 'awdf_tasks_fallback';

const getHeaders = () => {
  const token = authService.getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Prevent requests from hanging forever — always settle within 8s.
const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const handleUnauthorized = () => {
  authService.removeToken();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const getLocalTasks = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    const initialTasks = [
      { id: 1, title: 'Complete Practical Assignment', description: 'Finish task management integration' },
      { id: 2, title: 'Review React Router', description: 'Ensure all pages route correctly' },
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialTasks));
    return initialTasks;
  }
  return JSON.parse(data);
};

const setLocalTasks = (tasks) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
};

export const taskService = {
  // GET /tasks
  getAll: async (page = 1, limit = 5) => {
    try {
      const res = await fetchWithTimeout(`${API_URL}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (res.status === 401) {
        if (authService.getToken()) {
          // A real JWT session is invalid/expired — force re-login.
          handleUnauthorized();
          throw new Error('Unauthorized. Please login again.');
        }
        // No JWT token (offline/mock login) — do not redirect; use local fallback.
        throw new Error('Backend requires JWT login. Using local tasks.');
      }

      if (!res.ok) throw new Error('Failed to load tasks');
      return await res.json();
    } catch (err) {
      if (err.message.includes('Unauthorized')) throw err;

      console.warn('Backend API offline or unavailable. Falling back to local storage.');
      const local = getLocalTasks();
      const total = local.length;
      const start = (page - 1) * limit;
      const pageItems = local.slice(start, start + limit);
      return {
        tasks: pageItems,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    }
  },

  // POST /tasks
  create: async (task) => {
    try {
      const res = await fetchWithTimeout(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(task),
      });

      if (res.status === 401) {
        if (authService.getToken()) {
          // A real JWT session is invalid/expired — force re-login.
          handleUnauthorized();
          throw new Error('Unauthorized. Please login again.');
        }
        // No JWT token (offline/mock login) — do not redirect; use local fallback.
        throw new Error('Backend requires JWT login. Using local tasks.');
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || errData.error || 'Failed to create task');
      }
      return await res.json();
    } catch (err) {
      if (err.message.includes('Unauthorized')) throw err;

      const local = getLocalTasks();
      const newTask = {
        id: local.length > 0 ? Math.max(...local.map((t) => t.id)) + 1 : 1,
        ...task,
      };
      const updated = [...local, newTask];
      setLocalTasks(updated);
      return newTask;
    }
  },

  // PUT /tasks/:id
  update: async (id, task) => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(task),
      });

      if (res.status === 401) {
        if (authService.getToken()) {
          // A real JWT session is invalid/expired — force re-login.
          handleUnauthorized();
          throw new Error('Unauthorized. Please login again.');
        }
        // No JWT token (offline/mock login) — do not redirect; use local fallback.
        throw new Error('Backend requires JWT login. Using local tasks.');
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || errData.error || 'Failed to update task');
      }
      return await res.json();
    } catch (err) {
      if (err.message.includes('Unauthorized')) throw err;

      const local = getLocalTasks();
      const updated = local.map((t) => (t.id === id ? { ...t, ...task } : t));
      setLocalTasks(updated);
      return { id, ...task };
    }
  },

  // DELETE /tasks/:id
  delete: async (id) => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (res.status === 401) {
        if (authService.getToken()) {
          // A real JWT session is invalid/expired — force re-login.
          handleUnauthorized();
          throw new Error('Unauthorized. Please login again.');
        }
        // No JWT token (offline/mock login) — do not redirect; use local fallback.
        throw new Error('Backend requires JWT login. Using local tasks.');
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || errData.error || 'Failed to delete task');
      }
      return await res.json();
    } catch (err) {
      if (err.message.includes('Unauthorized')) throw err;

      const local = getLocalTasks();
      const updated = local.filter((t) => t.id !== id);
      setLocalTasks(updated);
      return { id };
    }
  },
};
