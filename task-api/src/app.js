const express = require('express');
const path = require('path');
const taskService = require('./taskService');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/tasks', (req, res) => {
  const { status, page, limit } = req.query;
  const filters = { status };
  const pagination = { 
    page: parseInt(page), 
    limit: parseInt(limit) 
  };
  
  const tasks = taskService.listTasks(filters, pagination);
  res.json(tasks);
});

app.get('/tasks/stats', (req, res) => {
  const stats = taskService.getStats();
  res.json(stats);
});

app.get('/tasks/:id', (req, res) => {
  const task = taskService.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.post('/tasks', (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const task = taskService.createTask(req.body);
  res.status(201).json(task);
});

app.put('/tasks/:id', (req, res) => {
  const task = taskService.updateTask(req.params.id, req.body);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const success = taskService.deleteTask(req.params.id);
  if (!success) return res.status(404).json({ error: 'Task not found' });
  res.status(204).send();
});

app.patch('/tasks/:id/complete', (req, res) => {
  const task = taskService.completeTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.patch('/tasks/:id/assign', (req, res) => {
  try {
    const task = taskService.assignTask(req.params.id, req.body.assignee);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = app;
