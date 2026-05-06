/**
 * In-memory task store.
 * Resets every time the server restarts — no DB needed.
 */

let tasks = [];

const getAll = () => tasks;

const getById = (id) => tasks.find((t) => t.id === id) || null;

const insert = (task) => {
  tasks.push(task);
  return task;
};

const update = (id, updates) => {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...updates };
  return tasks[idx];
};

const remove = (id) => {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
};

// Used in tests to reset state between test suites
const reset = () => {
  tasks = [];
};

module.exports = { getAll, getById, insert, update, remove, reset };
