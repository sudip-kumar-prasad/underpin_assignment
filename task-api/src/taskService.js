const { v4: uuidv4 } = require('uuid');
const store = require('./store');

/**
 * Lists tasks based on filters and pagination.
 * @param {Object} filters - Filter criteria (e.g., status).
 * @param {Object} pagination - Pagination options (page, limit).
 * @returns {Array} Filtered and paginated list of tasks.
 */
const listTasks = (filters = {}, pagination = {}) => {
  let tasks = store.getAll();

  if (filters.status) {
    tasks = tasks.filter(t => t.status === filters.status);
  }

  // Note: Standardizes pagination to handle 0 or invalid inputs gracefully
  if (pagination.page > 0 && pagination.limit > 0) {
    const start = (pagination.page - 1) * pagination.limit;
    tasks = tasks.slice(start, start + pagination.limit);
  }

  return tasks;
};

/**
 * Retrieves a single task by its unique ID.
 * @param {string} id - The task ID.
 * @returns {Object|null} The task object or null if not found.
 */
const getTaskById = (id) => {
  return store.getById(id);
};

/**
 * Creates a new task with default metadata.
 * @param {Object} data - Task details (title, description, etc.).
 * @returns {Object} The newly created task.
 */
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

/**
 * Updates an existing task while protecting immutable fields.
 * Fixes Bug 1 (ID Mutation) and Bug 2 (completedAt automation).
 * @param {string} id - The task ID.
 * @param {Object} updates - Fields to update.
 * @returns {Object|null} Updated task or null if not found.
 */
const updateTask = (id, updates) => {
  const task = store.getById(id);
  if (!task) return null;

  // Security: Prevent mutation of immutable system fields
  const { id: _, createdAt: __, ...sanitizedUpdates } = updates;

  // Business Logic: Automatically manage completedAt timestamp based on status change
  if (sanitizedUpdates.status === 'done' && task.status !== 'done') {
    sanitizedUpdates.completedAt = new Date().toISOString();
  } else if (sanitizedUpdates.status && sanitizedUpdates.status !== 'done') {
    sanitizedUpdates.completedAt = null;
  }

  return store.update(id, sanitizedUpdates);
};

/**
 * Assigns a task to a user.
 * @param {string} id - The task ID.
 * @param {string} assignee - Name of the person to assign.
 * @throws {Error} If assignee is empty or invalid.
 * @returns {Object|null} Updated task.
 */
const assignTask = (id, assignee) => {
  const task = store.getById(id);
  if (!task) return null;

  // Validation: assignee should not be empty
  if (typeof assignee !== 'string' || assignee.trim() === '') {
    throw new Error('Assignee must be a non-empty string');
  }

  return store.update(id, { assignee: assignee.trim() });
};

/**
 * Deletes a task from the store.
 * @param {string} id - The task ID.
 * @returns {boolean} True if deleted, false otherwise.
 */
const deleteTask = (id) => {
  return store.remove(id);
};

/**
 * Marks a task as complete explicitly.
 * @param {string} id - The task ID.
 * @returns {Object|null} Updated task.
 */
const completeTask = (id) => {
  const task = store.getById(id);
  if (!task) return null;

  return store.update(id, {
    status: 'done',
    completedAt: new Date().toISOString()
  });
};

/**
 * Calculates task statistics.
 * @returns {Object} Count of tasks by status and overdue count.
 */
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
