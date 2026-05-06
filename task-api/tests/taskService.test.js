const taskService = require('../src/taskService');
const store = require('../src/store');

describe('TaskService Unit Tests', () => {
  beforeEach(() => {
    store.reset();
  });

  describe('createTask', () => {
    it('should create a task with default values', () => {
      const task = taskService.createTask({ title: 'Test Task' });
      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('medium');
      expect(task.createdAt).toBeDefined();
      expect(task.completedAt).toBeNull();
    });
  });

  describe('listTasks', () => {
    it('should list all tasks', () => {
      taskService.createTask({ title: 'Task 1' });
      taskService.createTask({ title: 'Task 2' });
      const tasks = taskService.listTasks();
      expect(tasks.length).toBe(2);
    });

    it('should filter by status', () => {
      taskService.createTask({ title: 'Task 1', status: 'todo' });
      taskService.createTask({ title: 'Task 2', status: 'done' });
      const todoTasks = taskService.listTasks({ status: 'todo' });
      expect(todoTasks.length).toBe(1);
      expect(todoTasks[0].title).toBe('Task 1');
    });

    it('should handle pagination', () => {
      for (let i = 1; i <= 5; i++) {
        taskService.createTask({ title: `Task ${i}` });
      }
      const page1 = taskService.listTasks({}, { page: 1, limit: 2 });
      const page2 = taskService.listTasks({}, { page: 2, limit: 2 });
      expect(page1.length).toBe(2);
      expect(page2.length).toBe(2);
      expect(page1[0].title).toBe('Task 1');
      expect(page2[0].title).toBe('Task 3');
    });
  });

  describe('updateTask', () => {
    it('should not allow changing id or createdAt', () => {
      const task = taskService.createTask({ title: 'T1' });
      const oldId = task.id;
      const oldCreatedAt = task.createdAt;

      const updated = taskService.updateTask(oldId, { 
        id: 'new-id', 
        createdAt: '2000-01-01',
        title: 'New Title' 
      });

      expect(updated.id).toBe(oldId);
      expect(updated.createdAt).toBe(oldCreatedAt);
      expect(updated.title).toBe('New Title');
    });

    it('should set completedAt when status is changed to done', () => {
      const task = taskService.createTask({ title: 'T1', status: 'todo' });
      const updated = taskService.updateTask(task.id, { status: 'done' });
      expect(updated.status).toBe('done');
      expect(updated.completedAt).not.toBeNull();
    });
  });

  describe('assignTask', () => {
    it('should assign a task to a user', () => {
      const task = taskService.createTask({ title: 'T1' });
      const updated = taskService.assignTask(task.id, 'John Doe');
      expect(updated.assignee).toBe('John Doe');
    });

    it('should throw error for empty assignee', () => {
      const task = taskService.createTask({ title: 'T1' });
      expect(() => taskService.assignTask(task.id, '')).toThrow('Assignee must be a non-empty string');
      expect(() => taskService.assignTask(task.id, '   ')).toThrow('Assignee must be a non-empty string');
    });
  });

  describe('completeTask', () => {
    it('should mark task as done and set completedAt', () => {
      const task = taskService.createTask({ title: 'Task' });
      const completed = taskService.completeTask(task.id);
      expect(completed.status).toBe('done');
      expect(completed.completedAt).not.toBeNull();
    });

    it('should return null for non-existent task', () => {
      const result = taskService.completeTask('invalid-id');
      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return correct counts', () => {
      taskService.createTask({ title: 'T1', status: 'todo' });
      taskService.createTask({ title: 'T2', status: 'todo' });
      taskService.createTask({ title: 'T3', status: 'done' });
      
      const stats = taskService.getStats();
      expect(stats.todo).toBe(2);
      expect(stats.done).toBe(1);
    });

    it('should count overdue tasks', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      taskService.createTask({ title: 'Overdue', dueDate: yesterday.toISOString(), status: 'todo' });
      taskService.createTask({ title: 'Future', dueDate: new Date(Date.now() + 86400000).toISOString(), status: 'todo' });
      taskService.createTask({ title: 'Done Overdue', dueDate: yesterday.toISOString(), status: 'done' });

      const stats = taskService.getStats();
      expect(stats.overdue).toBe(1); // Only non-done tasks should be counted as overdue
    });
  });
});
