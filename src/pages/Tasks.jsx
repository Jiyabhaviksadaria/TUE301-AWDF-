import { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';

const LOGS_STORAGE_KEY = 'awdf_task_csv_logs';

const getStoredLogs = () => {
  try {
    const data = localStorage.getItem(LOGS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLogsToStorage = (logs) => {
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
};

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [logs, setLogs] = useState(getStoredLogs);
  const [showLogView, setShowLogView] = useState(false);

  const addLog = (action, taskId, taskTitle, taskDesc) => {
    const now = new Date();
    const formattedTime = now.toLocaleString();
    const newLog = {
      id: Date.now(),
      action,
      taskId: taskId || 'N/A',
      title: taskTitle || 'N/A',
      description: taskDesc || '',
      timestamp: formattedTime,
    };
    setLogs((prevLogs) => {
      const updated = [newLog, ...prevLogs];
      saveLogsToStorage(updated);
      return updated;
    });
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 3500);
  };

  const fetchTasks = async () => {
    try {
      setError(null);
      const data = await taskService.getAll();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Load all tasks on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const taskPayload = { title, description };

    try {
      setError(null);
      if (editingTaskId) {
        // Update existing task
        await taskService.update(editingTaskId, taskPayload);
        await fetchTasks();
        addLog('UPDATED', editingTaskId, title, description);
        setEditingTaskId(null);
        showToast(`Task "${title}" updated & logged in CSV!`, 'success');
      } else {
        // Create new task
        const created = await taskService.create(taskPayload);
        await fetchTasks();
        addLog('SAVED', created.id || 'NEW', title, description);
        showToast(`Task "${title}" saved & logged in CSV!`, 'success');
      }

      // Reset form
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setError(null);
  };

  const handleDelete = async (id, taskTitle, taskDesc) => {
    try {
      setError(null);
      await taskService.delete(id);
      await fetchTasks();
      addLog('DELETED', id, taskTitle, taskDesc || '');
      showToast(`Task ${taskTitle ? `"${taskTitle}" ` : ''}deleted & logged in CSV!`, 'delete');
      if (editingTaskId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const generateCSV = () => {
    const headers = ['Log ID', 'Action', 'Task ID', 'Title', 'Description', 'Timestamp'];
    const rows = logs.map((log) => [
      log.id,
      log.action,
      log.taskId,
      `"${(log.title || '').replace(/"/g, '""')}"`,
      `"${(log.description || '').replace(/"/g, '""')}"`,
      `"${log.timestamp}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  const downloadCSV = () => {
    if (logs.length === 0) {
      showToast('No logs available to download yet.', 'delete');
      return;
    }
    const csvString = generateCSV();
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('CSV file downloaded successfully!', 'success');
  };

  const clearLogs = () => {
    setLogs([]);
    saveLogsToStorage([]);
    showToast('Activity logs cleared', 'delete');
  };

  return (
    <section className="contact-card">
      <div className="task-header-row">
        <div>
          <p className="eyebrow">Tasks</p>
          <h2>Task Management</h2>
        </div>

        <div className="csv-actions">
          <button type="button" className="form-button csv-btn" onClick={downloadCSV}>
            📥 Download CSV Logs
          </button>
          <button
            type="button"
            className="form-button csv-btn"
            onClick={() => setShowLogView((prev) => !prev)}
          >
            {showLogView ? 'Hide CSV Logs' : '📋 View CSV Logs'}
          </button>
        </div>
      </div>

      {toast && (
        <div className={`toast-notification toast-${toast.type}`} role="status">
          <span className="toast-icon">
            {toast.type === 'success' ? '✓' : toast.type === 'delete' ? '🗑️' : 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Close notification">
            &times;
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <form className="contact-form" onSubmit={handleSubmit}>
        <label htmlFor="title">
          Title
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter task title"
            required
          />
        </label>

        <label htmlFor="description">
          Description
          <input
            id="description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter task description"
          />
        </label>

        <div className="action-row">
          <button type="submit" className="form-button">
            {editingTaskId ? 'Update Task' : 'Add Task'}
          </button>
          {editingTaskId && (
            <button type="button" className="form-button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="task-table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleStartEdit(task)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(task.id, task.title, task.description)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showLogView && (
        <div className="csv-logs-section">
          <div className="csv-logs-header">
            <h3>Recorded CSV Activity Logs ({logs.length})</h3>
            {logs.length > 0 && (
              <button type="button" className="delete-btn" onClick={clearLogs}>
                Clear Logs
              </button>
            )}
          </div>
          <div className="task-table-container">
            <table className="task-table csv-logs-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Task ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className={`log-badge log-badge-${log.action}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.taskId}</td>
                    <td>{log.title}</td>
                    <td>{log.description || '-'}</td>
                    <td>{log.timestamp}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      No activity logged yet. Add or delete a task to generate CSV logs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default Tasks;
