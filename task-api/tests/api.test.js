const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store');

describe('Task API Integration Tests', () => {
  beforeEach(() => {
    store.reset();
  });

  describe('GET /tasks', () => {
    it('should return empty array initially', async () => {
      const res = await request(app).get('/tasks');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return tasks after creation', async () => {
      await request(app).post('/tasks').send({ title: 'Task 1' });
      const res = await request(app).get('/tasks');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });

  describe('GET /tasks/stats', () => {
    it('should return correct task statistics', async () => {
      await request(app).post('/tasks').send({ title: 'T1', status: 'todo' });
      await request(app).post('/tasks').send({ title: 'T2', status: 'done' });
      
      const res = await request(app).get('/tasks/stats');
      expect(res.status).toBe(200);
      expect(res.body.todo).toBe(1);
      expect(res.body.done).toBe(1);
    });
  });

  describe('POST /tasks', () => {
    it('should create a task', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'New Task', description: 'Desc' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('New Task');
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app).post('/tasks').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update a task', async () => {
      const createRes = await request(app).post('/tasks').send({ title: 'Old' });
      const id = createRes.body.id;
      
      const res = await request(app)
        .put(`/tasks/${id}`)
        .send({ title: 'New' });
      
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('New');
    });

    it('should return 404 for missing task', async () => {
      const res = await request(app).put('/tasks/999').send({ title: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    it('should complete task', async () => {
      const createRes = await request(app).post('/tasks').send({ title: 'T' });
      const id = createRes.body.id;
      
      const res = await request(app).patch(`/tasks/${id}/complete`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('done');
      expect(res.body.completedAt).toBeDefined();
    });
  });

  describe('PATCH /tasks/:id/assign', () => {
    it('should assign a task', async () => {
      const createRes = await request(app).post('/tasks').send({ title: 'T' });
      const id = createRes.body.id;
      
      const res = await request(app)
        .patch(`/tasks/${id}/assign`)
        .send({ assignee: 'Alice' });
      
      expect(res.status).toBe(200);
      expect(res.body.assignee).toBe('Alice');
    });

    it('should return 400 for empty assignee', async () => {
      const createRes = await request(app).post('/tasks').send({ title: 'T' });
      const id = createRes.body.id;
      
      const res = await request(app)
        .patch(`/tasks/${id}/assign`)
        .send({ assignee: '' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .patch('/tasks/non-existent/assign')
        .send({ assignee: 'Alice' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete task', async () => {
      const createRes = await request(app).post('/tasks').send({ title: 'T' });
      const id = createRes.body.id;
      
      const delRes = await request(app).delete(`/tasks/${id}`);
      expect(delRes.status).toBe(204);
      
      const getRes = await request(app).get(`/tasks/${id}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid query params gracefully', async () => {
      const res = await request(app).get('/tasks?page=abc&limit=xyz');
      expect(res.status).toBe(200); // Should probably default or ignore invalid params
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should handle large pagination limits', async () => {
      const res = await request(app).get('/tasks?page=1&limit=10000');
      expect(res.status).toBe(200);
    });
  });
});
