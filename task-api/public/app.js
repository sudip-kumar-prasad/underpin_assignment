const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const toggleFormBtn = document.getElementById('toggle-form');
const cancelFormBtn = document.getElementById('cancel-form');

// Toggle Form Visibility
toggleFormBtn.addEventListener('click', () => taskForm.classList.add('active'));
cancelFormBtn.addEventListener('click', () => taskForm.classList.remove('active'));

// Fetch and Render Tasks
async function fetchTasks() {
  const response = await fetch('/tasks');
  const tasks = await response.json();
  renderTasks(tasks);
  updateStats();
}

async function updateStats() {
  const response = await fetch('/tasks/stats');
  const stats = await response.json();
  document.getElementById('stat-todo').innerText = stats.todo;
  document.getElementById('stat-in-progress').innerText = stats.in_progress;
  document.getElementById('stat-done').innerText = stats.done;
  document.getElementById('stat-overdue').innerText = stats.overdue;
}

function renderTasks(tasks) {
  taskList.innerHTML = tasks.length ? '' : '<p class="text-muted" style="text-align: center; padding: 2rem;">No tasks yet. Create one!</p>';
  
  tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card';
    
    card.innerHTML = `
      <div class="task-info">
        <h3>${task.title}</h3>
        <div class="task-meta">
          <span class="badge badge-${task.status}">${task.status.replace('_', ' ')}</span>
          <span>Priority: ${task.priority}</span>
          ${task.dueDate ? `<span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
          ${task.assignee ? `<span style="color: #818cf8">@${task.assignee}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        ${task.status !== 'done' ? `
          <input type="text" placeholder="Assignee..." class="assignee-input" id="assign-${task.id}">
          <button class="btn-icon" onclick="assignTask('${task.id}')" title="Assign">👤</button>
          <button class="btn-icon" onclick="completeTask('${task.id}')" title="Complete">✓</button>
        ` : ''}
        <button class="btn-icon" onclick="deleteTask('${task.id}')" title="Delete">🗑️</button>
      </div>
    `;
    taskList.appendChild(card);
  });
}

// API Actions
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    title: document.getElementById('task-title').value,
    description: document.getElementById('task-desc').value,
    priority: document.getElementById('task-priority').value,
    dueDate: document.getElementById('task-due').value || null
  };

  await fetch('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  taskForm.reset();
  taskForm.classList.remove('active');
  fetchTasks();
});

async function completeTask(id) {
  await fetch(`/tasks/${id}/complete`, { method: 'PATCH' });
  fetchTasks();
}

async function deleteTask(id) {
  if (confirm('Are you sure?')) {
    await fetch(`/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  }
}

async function assignTask(id) {
  const assignee = document.getElementById(`assign-${id}`).value;
  if (!assignee) return alert('Enter a name');

  const res = await fetch(`/tasks/${id}/assign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignee })
  });

  if (!res.ok) {
    const error = await res.json();
    alert(error.error);
  } else {
    fetchTasks();
  }
}

// Initial Load
fetchTasks();
