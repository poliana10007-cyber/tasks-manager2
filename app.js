let tasks = [];

// Загрузка задач из localStorage
function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        tasks = JSON.parse(saved);
    }
    renderTasks();
}

// Сохранение задач в localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return true;
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
});

// Добавление новой задачи
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const assignTo = document.getElementById('assignTo');
    const difficulty = document.getElementById('difficulty');
    
    const text = taskInput.value.trim();
    if (!text) {
        alert('Введите текст задачи!');
        return;
    }
    
    const newTask = {
        id: Date.now().toString(),
        text: text,
        assignTo: assignTo.value,
        difficulty: difficulty.value,
        status: 'new',
        createdAt: new Date().toISOString(),
        comments: []
    };
    
    tasks.push(newTask);
    saveTasks();
    taskInput.value = '';
    alert('Задача добавлена! 🎉');
    renderTasks();
}

// Удаление задачи
function deleteTask(taskId) {
    if (confirm('Удалить эту задачу?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        alert('Задача удалена! 🗑️');
        renderTasks();
    }
}

// Изменение статуса задачи
function changeStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;
        saveTasks();
        
        const statusNames = {
            'new': 'Новые',
            'inProgress': 'В работе', 
            'completed': 'Выполнено'
        };
        alert(`Задача перемещена в "${statusNames[newStatus]}"!`);
        renderTasks();
    }
}

// Отображение задач
function renderTasks() {
    const containers = {
        new: document.getElementById('newTasks'),
        inProgress: document.getElementById('inProgressTasks'),
        completed: document.getElementById('completedTasks')
    };
    
    // Очищаем контейнеры
    Object.values(containers).forEach(container => {
        container.innerHTML = '';
    });
    
    // Сортируем задачи по дате (новые сверху)
    const sortedTasks = [...tasks].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // Добавляем задачи в соответствующие колонки
    sortedTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        if (containers[task.status]) {
            containers[task.status].appendChild(taskElement);
        }
    });
    
    // Если колонка пустая - показываем сообщение
    Object.values(containers).forEach(container => {
        if (container.children.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-state';
            emptyMsg.textContent = 'Пока нет задач';
            container.appendChild(emptyMsg);
        }
    });
}

// Создание элемента задачи
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${task.difficulty}`;
    
    const assigneeName = task.assignTo === 'ulyana' ? 'Ульяна' : 'Сережа';
    const difficultyText = {
        'easy': '🟢 Простая',
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

// Обработка нажатия Enter в поле ввода
document.getElementById('taskInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});
