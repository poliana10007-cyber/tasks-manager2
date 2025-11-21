let tasks = [];

// Загрузка при запуске
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
});

// Загрузка из localStorage
function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        tasks = JSON.parse(saved);
    }
    renderTasks();
}

// Сохранение в localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Добавление задачи
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const text = taskInput.value.trim();
    
    if (!text) return;
    
    const newTask = {
        id: Date.now().toString(),
        text: text,
        assignTo: document.getElementById('assignTo').value,
        difficulty: document.getElementById('difficulty').value,
        status: 'new',
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    taskInput.value = '';
    alert('✅ Задача добавлена!');
    renderTasks();
}

// Удаление задачи
function deleteTask(taskId) {
    if (confirm('Удалить задачу?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        alert('🗑️ Задача удалена!');
        renderTasks();
    }
}

// Изменение статуса
function changeStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;
        saveTasks();
        renderTasks();
    }
}

// Отображение задач
function renderTasks() {
    const newTasks = document.getElementById('newTasks');
    const inProgressTasks = document.getElementById('inProgressTasks');
    const completedTasks = document.getElementById('completedTasks');
    
    newTasks.innerHTML = '';
    inProgressTasks.innerHTML = '';
    completedTasks.innerHTML = '';
    
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        if (task.status === 'new') newTasks.appendChild(taskElement);
        else if (task.status === 'inProgress') inProgressTasks.appendChild(taskElement);
        else if (task.status === 'completed') completedTasks.appendChild(taskElement);
    });
    
    if (newTasks.children.length === 0) newTasks.innerHTML = '<div class="empty-state">Нет новых задач</div>';
    if (inProgressTasks.children.length === 0) inProgressTasks.innerHTML = '<div class="empty-state">Нет задач в работе</div>';
    if (completedTasks.children.length === 0) completedTasks.innerHTML = '<div class="empty-state">Нет выполненных задач</div>';
}

// Создание элемента задачи
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${task.difficulty}`;
    
    const assigneeName = task.assignTo === 'ulyana' ? '👩 Ульяна' : '👨 Сережа';
    const difficultyText = {
        'easy': '🟢 Легкая',
        'medium': '🟡 Средняя', 
        'hard': '🔴 Сложная'
    };
    
    taskDiv.innerHTML = `
        <div class="task-header">
            <span class="task-assignee ${task.assignTo}">${assigneeName}</span>
            <span class="difficulty-badge">${difficultyText[task.difficulty]}</span>
        </div>
        <div class="task-text">${task.text}</div>
        <div class="task-time">${new Date(task.createdAt).toLocaleString('ru-RU')}</div>
        <div class="task-actions">
            ${task.status !== 'new' ? `<button class="action-btn" onclick="changeStatus('${task.id}', 'new')">⬅️ Назад</button>` : ''}
            ${task.status !== 'inProgress' ? `<button class="action-btn" onclick="changeStatus('${task.id}', 'inProgress')">⏳ В работу</button>` : ''}
            ${task.status !== 'completed' ? `<button class="action-btn" onclick="changeStatus('${task.id}', 'completed')">✅ Выполнено</button>` : ''}
            <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')">🗑️ Удалить</button>
        </div>
    `;
    
    return taskDiv;
}

// Enter для добавления
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addTask();
});
