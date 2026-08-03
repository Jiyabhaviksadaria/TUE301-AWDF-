const API_URL = 'http://localhost:5000/tasks';
const LOCAL_STORAGE_KEY = 'awdf_tasks_fallback';

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
  getAll: async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to load tasks');
      return await res.json();
    } catch {
      console.warn('Backend API at http://localhost:5000/tasks offline. Falling back to local storage.');
      return getLocalTasks();
    }
  },

  // POST /tasks
  create: async (task) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create task');
      }
      return await res.json();
    } catch {
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
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update task');
      }
      return await res.json();
    } catch {
      const local = getLocalTasks();
      const updated = local.map((t) => (t.id === id ? { ...t, ...task } : t));
      setLocalTasks(updated);
      return { id, ...task };
    }
  },

  // DELETE /tasks/:id
  delete: async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete task');
      }
      return await res.json();
    } catch {
      const local = getLocalTasks();
      const updated = local.filter((t) => t.id !== id);
      setLocalTasks(updated);
      return { id };
    }
  },
};
