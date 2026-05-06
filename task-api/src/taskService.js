const { v4: uuidv4 } = require('uuid');
const store = require('./store');

const listTasks = (filters = {}, pagination = {}) => {
  let tasks = store.getAll();

  if (filters.status) {
    tasks = tasks.filter(t => t.status === filters.status);
  }

  if (pagination.page > 0 && pagination.limit > 0) {
    const start = (pagination.page - 1) * pagination.limit;
    tasks = tasks.slice(start, start + pagination.limit);
  }

  return tasks;
};

const getTaskById = (id) => {
  return store.getById(id);
};

const createTask = (data) => {
  const newTask = {
    id: uuidv4(),
    title: data.title,
    description: data.description || '',
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    dueDate: data.dueDate || null,
    completedAt: null,
    createdAt: new Date().toISOString()
  };

  return store.insert(newTask);
};

const updateTask = (id, updates) => {
  const task = store.getById(id);
  if (!task) return null;

  const { id: _, createdAt: __, ...sanitizedUpdates } = updates;

  if (sanitizedUpdates.status === 'done' && task.status !== 'done') {
    sanitizedUpdates.completedAt = new Date().toISOString();
  } else if (sanitizedUpdates.status && sanitizedUpdates.status !== 'done') {
    sanitizedUpdates.completedAt = null;
  }

  return store.update(id, sanitizedUpdates);
};

const assignTask = (id, assignee) => {
  const task = store.getById(id);
  if (!task) return null;

  // Validation: assignee should not be empty
  if (typeof assignee !== 'string' || assignee.trim() === '') {
    throw new Error('Assignee must be a non-empty string');
  }

  return store.update(id, { assignee: assignee.trim() });
};

const deleteTask = (id) => {
  return store.remove(id);
};

const completeTask = (id) => {
  const task = store.getById(id);
  if (!task) return null;

  return store.update(id, {
    status: 'done',
    completedAt: new Date().toISOString()
  });
};

const getStats = () => {
  const tasks = store.getAll();
  const now = new Date();

  const stats = {
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now).length
  };

  return stats;
};

module.exports = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  assignTask,
  getStats
};
