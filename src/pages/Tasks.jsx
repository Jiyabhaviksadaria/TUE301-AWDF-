import { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [error, setError] = useState(null);

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
        setEditingTaskId(null);
      } else {
        // Create new task
        await taskService.create(taskPayload);
        await fetchTasks();
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

  const handleDelete = async (id) => {
    try {
      setError(null);
      await taskService.delete(id);
      await fetchTasks();
      if (editingTaskId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="contact-card">
      <div>
        <p className="eyebrow">Tasks</p>
        <h2>Task Management</h2>
      </div>

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
                  <button className="delete-btn" onClick={() => handleDelete(task.id)}>
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
    </section>
  );
}

export default Tasks;
