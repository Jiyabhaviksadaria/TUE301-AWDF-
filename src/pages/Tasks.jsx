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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskStatus, setTaskStatus] = useState('pending');
  const [viewMode, setViewMode] = useState('3-parts');
  const [completedTaskDetails, setCompletedTaskDetails] = useState(null);
  const [logs, setLogs] = useState(getStoredLogs);
  const [showLogView, setShowLogView] = useState(false);
  const [locationInfo, setLocationInfo] = useState({
    ip: 'Detecting...',
    state: 'Detecting...',
    country: 'Detecting...',
  });

  // Detect user IP address, State, and Country on mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          setLocationInfo({
            ip: data.ip || '127.0.0.1',
            state: data.region || data.city || 'Unknown',
            country: data.country_name || data.country || 'Unknown',
          });
          return;
        }
      } catch {
        // Fallback to secondary IP geolocation service
      }

      try {
        const res = await fetch('https://ipwho.is/');
        if (res.ok) {
          const data = await res.json();
          setLocationInfo({
            ip: data.ip || '127.0.0.1',
            state: data.region || data.city || 'Local',
            country: data.country || 'Local',
          });
          return;
        }
      } catch {
        setLocationInfo({ ip: '127.0.0.1', state: 'Local', country: 'Local' });
      }
    };

    detectLocation();
  }, []);

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
      ip: locationInfo.ip,
      state: locationInfo.state,
      country: locationInfo.country,
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

  const LIMIT = 5;

  const fetchTasks = async (p = page) => {
    try {
      setError(null);
      const res = await taskService.getAll(p, LIMIT);
      // res may be either { tasks, meta } or (legacy) array
      if (Array.isArray(res)) {
        setTasks(res);
        setTotalPages(1);
      } else {
        setTasks(res.tasks || []);
        setTotalPages(res.meta?.totalPages || 1);
        setPage(res.meta?.page || p);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Load all tasks on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks(1);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const now = new Date().toLocaleString();
    const taskPayload = { title, description, status: taskStatus };
    if (taskStatus === 'completed') {
      taskPayload.completedAt = now;
    }

    try {
      setError(null);
      if (editingTaskId) {
        // Update existing task
        await taskService.update(editingTaskId, taskPayload);
        await fetchTasks(page);
        addLog('UPDATED', editingTaskId, title, `${description || ''} [Status: ${taskStatus}]`);
        setEditingTaskId(null);
        showToast(`Task "${title}" updated & logged in CSV!`, 'success');
      } else {
        // Create new task
        const created = await taskService.create(taskPayload);
        // After creating, fetch the first page (or stay on current page)
        await fetchTasks(page);
        addLog('SAVED', created.id || 'NEW', title, `${description || ''} [Status: ${taskStatus}]`);
        showToast(`Task "${title}" saved & logged in CSV!`, 'success');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setTaskStatus('pending');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setTaskStatus(task.status || 'pending');
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setTaskStatus('pending');
    setError(null);
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      setError(null);
      const updateData = { status: newStatus };
      if (newStatus === 'completed') {
        updateData.completedAt = new Date().toLocaleString();
      }
      await taskService.update(task.id, updateData);
      await fetchTasks(page);
      addLog('UPDATED', task.id, task.title, `Status changed to "${newStatus}"`);
      showToast(`Task #${task.id} moved to ${newStatus}!`, 'success');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id, taskTitle, taskDesc) => {
    try {
      setError(null);
      await taskService.delete(id);
      // refetch current page; if it becomes empty, move back one page
      await fetchTasks(page);
      // adjust page if current page has no items
      if (tasks.length === 1 && page > 1) {
        const newPage = page - 1;
        setPage(newPage);
        await fetchTasks(newPage);
      }
      addLog('DELETED', id, taskTitle, taskDesc || '');
      showToast(`Task ${taskTitle ? `"${taskTitle}" ` : ''}deleted & logged in CSV!`, 'delete');
      if (editingTaskId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    await fetchTasks(newPage);
  };

  const generateCSV = () => {
    const headers = [
      'Log ID',
      'Action',
      'Task ID',
      'Title',
      'Description',
      'Timestamp',
      'IP Address',
      'State',
      'Country',
    ];
    const rows = logs.map((log) => [
      log.id,
      log.action,
      log.taskId,
      `"${(log.title || '').replace(/"/g, '""')}"`,
      `"${(log.description || '').replace(/"/g, '""')}"`,
      `"${log.timestamp}"`,
      `"${log.ip || 'N/A'}"`,
      `"${(log.state || 'N/A').replace(/"/g, '""')}"`,
      `"${(log.country || 'N/A').replace(/"/g, '""')}"`,
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
          <p className="muted location-pill">
            📍 IP: {locationInfo.ip} | Location: {locationInfo.state}, {locationInfo.country}
          </p>
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

        <label htmlFor="taskStatus">
          Status
          <select
            id="taskStatus"
            value={taskStatus}
            onChange={(e) => setTaskStatus(e.target.value)}
            className="status-select"
            style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', marginTop: '4px' }}
            disabled={Boolean(editingTaskId && taskStatus === 'completed')}
          >
            {editingTaskId && taskStatus === 'completed' ? (
              <option value="completed">🟢 Completed (Locked)</option>
            ) : (
              <>
                <option value="pending">🟡 Pending</option>
                <option value="in-progress">🔵 In Progress</option>
                <option value="completed">🟢 Completed</option>
              </>
            )}
          </select>
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', marginBottom: '8px' }}>
        <h3 style={{ margin: 0 }}>Task Categories</h3>
        <div className="view-mode-toggle">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === '3-parts' ? 'active' : ''}`}
            onClick={() => setViewMode('3-parts')}
          >
            📋 3-Parts View
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            📊 Table View
          </button>
        </div>
      </div>

      {viewMode === '3-parts' ? (
        <div className="three-parts-container">
          {/* Part 1: Pending Tasks */}
          <div className="status-column">
            <div className="status-column-header">
              <h4 className="status-column-title">
                <span>🟡</span> Pending Tasks
              </h4>
              <span className="status-count-badge">
                {tasks.filter((t) => (t.status || 'pending') === 'pending').length}
              </span>
            </div>
            {tasks.filter((t) => (t.status || 'pending') === 'pending').map((task) => (
              <div key={task.id} className="task-card">
                <div className="task-card-header">
                  <h5 className="task-card-title">#{task.id} - {task.title}</h5>
                  <span className="status-badge status-badge-pending">Pending</span>
                </div>
                {task.description && <p className="task-card-desc">{task.description}</p>}
                <div className="task-card-actions">
                  <select
                    className="status-select"
                    value={task.status || 'pending'}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                  >
                    <option value="pending">🟡 Pending</option>
                    <option value="in-progress">🔵 In Progress</option>
                    <option value="completed">🟢 Completed</option>
                  </select>
                  <div>
                    <button className="edit-btn" onClick={() => handleStartEdit(task)}>Edit</button>
                    <button className="delete-btn" onClick={() => setTaskToDelete(task)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {tasks.filter((t) => (t.status || 'pending') === 'pending').length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text)', textAlign: 'center', margin: '16px 0' }}>
                No pending tasks.
              </p>
            )}
          </div>

          {/* Part 2: In Progress Tasks */}
          <div className="status-column">
            <div className="status-column-header">
              <h4 className="status-column-title">
                <span>🔵</span> In Progress Tasks
              </h4>
              <span className="status-count-badge">
                {tasks.filter((t) => t.status === 'in-progress').length}
              </span>
            </div>
            {tasks.filter((t) => t.status === 'in-progress').map((task) => (
              <div key={task.id} className="task-card">
                <div className="task-card-header">
                  <h5 className="task-card-title">#{task.id} - {task.title}</h5>
                  <span className="status-badge status-badge-in-progress">In Progress</span>
                </div>
                {task.description && <p className="task-card-desc">{task.description}</p>}
                <div className="task-card-actions">
                  <select
                    className="status-select"
                    value={task.status || 'pending'}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                  >
                    <option value="pending">🟡 Pending</option>
                    <option value="in-progress">🔵 In Progress</option>
                    <option value="completed">🟢 Completed</option>
                  </select>
                  <div>
                    <button className="edit-btn" onClick={() => handleStartEdit(task)}>Edit</button>
                    <button className="delete-btn" onClick={() => setTaskToDelete(task)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {tasks.filter((t) => t.status === 'in-progress').length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text)', textAlign: 'center', margin: '16px 0' }}>
                No in-progress tasks.
              </p>
            )}
          </div>

          {/* Part 3: Completed Tasks */}
          <div className="status-column">
            <div className="status-column-header">
              <h4 className="status-column-title">
                <span>🟢</span> Completed Tasks
              </h4>
              <span className="status-count-badge">
                {tasks.filter((t) => t.status === 'completed').length}
              </span>
            </div>
            {tasks.filter((t) => t.status === 'completed').map((task) => (
              <div key={task.id} className="task-card">
                <div className="task-card-header">
                  <h5 className="task-card-title">#{task.id} - {task.title}</h5>
                  <span
                    className="status-badge status-badge-completed completed-clickable-badge"
                    onClick={() => setCompletedTaskDetails(task)}
                    title="Click to view completion timestamp popover"
                  >
                    Completed ℹ️
                  </span>
                </div>
                {task.description && <p className="task-card-desc">{task.description}</p>}
                <div className="task-card-actions">
                  <span
                    className="status-badge status-badge-completed completed-clickable-badge"
                    onClick={() => setCompletedTaskDetails(task)}
                    title="Click to view completion timestamp popover"
                  >
                    🟢 Completed ℹ️
                  </span>
                  <div>
                    <button className="edit-btn" onClick={() => handleStartEdit(task)}>Edit</button>
                    <button className="delete-btn" onClick={() => setTaskToDelete(task)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {tasks.filter((t) => t.status === 'completed').length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text)', textAlign: 'center', margin: '16px 0' }}>
                No completed tasks.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="task-table-container">
          <table className="task-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
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
                    {task.status === 'completed' ? (
                      <span
                        className="status-badge status-badge-completed completed-clickable-badge"
                        onClick={() => setCompletedTaskDetails(task)}
                        title="Click to view completion timestamp popover"
                      >
                        🟢 Completed ℹ️
                      </span>
                    ) : (
                      <select
                        className="status-select"
                        value={task.status || 'pending'}
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                      >
                        <option value="pending">🟡 Pending</option>
                        <option value="in-progress">🔵 In Progress</option>
                        <option value="completed">🟢 Completed</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleStartEdit(task)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => setTaskToDelete(task)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination" style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <button className="form-button" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
          Previous
        </button>
        <div>
          Page {page} of {totalPages}
        </div>
        <button className="form-button" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
          Next
        </button>
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
                  <th>IP Address</th>
                  <th>State</th>
                  <th>Country</th>
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
                    <td>{log.ip || '-'}</td>
                    <td>{log.state || '-'}</td>
                    <td>{log.country || '-'}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                      No activity logged yet. Add or delete a task to generate CSV logs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {taskToDelete && (
        <div className="modal-overlay" onClick={() => setTaskToDelete(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">🗑️</span>
              <h3 className="modal-title">Delete Task?</h3>
            </div>
            <div className="modal-body">
              Are you sure you want to delete task <strong>#{taskToDelete.id} "{taskToDelete.title}"</strong>?
              <br /><br />
              This action cannot be undone and will log a deletion record in your CSV activity history.
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="form-button"
                style={{ background: 'transparent' }}
                onClick={() => setTaskToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-btn"
                onClick={async () => {
                  const t = taskToDelete;
                  setTaskToDelete(null);
                  await handleDelete(t.id, t.title, t.description);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {completedTaskDetails && (
        <div className="modal-overlay" onClick={() => setCompletedTaskDetails(null)}>
          <div className="completion-popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="completion-popup-header">
              <span className="completion-popup-icon">🎉</span>
              <div>
                <h3 className="completion-popup-title">Task Completed!</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Verified Audit Record</span>
              </div>
            </div>

            <div className="completion-details-list">
              <div className="completion-detail-row">
                <span className="completion-detail-label">⏰ Completion Timestamp</span>
                <span className="completion-detail-value">
                  {completedTaskDetails.completedAt || new Date().toLocaleString()}
                </span>
              </div>

              <div className="completion-detail-row">
                <span className="completion-detail-label">📌 Task Title</span>
                <span className="completion-detail-value">
                  #{completedTaskDetails.id} - {completedTaskDetails.title}
                </span>
              </div>

              {completedTaskDetails.description && (
                <div className="completion-detail-row">
                  <span className="completion-detail-label">📝 Description</span>
                  <span className="completion-detail-value">{completedTaskDetails.description}</span>
                </div>
              )}

              <div className="completion-detail-row">
                <span className="completion-detail-label">👤 Completed By</span>
                <span className="completion-detail-value">
                  {localStorage.getItem('awdf_user') || 'Jiya Sadaria'}
                </span>
              </div>

              <div className="completion-detail-row">
                <span className="completion-detail-label">📍 Location Audit</span>
                <span className="completion-detail-value">
                  {locationInfo.state}, {locationInfo.country} ({locationInfo.ip})
                </span>
              </div>
            </div>

            <button
              type="button"
              className="form-button"
              style={{ width: '100%' }}
              onClick={() => setCompletedTaskDetails(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Tasks;
