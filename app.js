// Конфигурация GitHub
const GITHUB_CONFIG = {
    owner: 'poliana10007-cyber',
    repo: 'tasks-manager2', 
    path: 'tasks.json',
    token: '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'
};

let tasks = [];

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    setInterval(loadTasks, 5000);
});

// Загрузка задач из GitHub
async function loadTasks() {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (response.ok) {
            const data = await response.json();
            const content = JSON.parse(atob(data.content));
            
            if (content && content.tasks && Array.isArray(content.tasks)) {
                tasks = content.tasks;
            } else {
                tasks = [];
            }
            
            renderTasks();
            console.log('Задачи загружены:', tasks);
        } else {
            console.log('Ошибка загрузки:', response.status);
            tasks = [];
        }
    } catch (error) {
        console.log('Ошибка загрузки:', error);
        tasks = [];
    }
}

// Сохранение задач в GitHub
async function saveTasksToGitHub() {
    try {
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        let sha = null;
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
        }

        const contentToSave = { tasks: tasks };

        const updateResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Update tasks: ' + new Date().toLocaleString(),
                    content: btoa(JSON.stringify(contentToSave, null, 2)),
                    sha: sha
                })
            }
        );

        if (updateResponse.ok) {
            console.log('Задачи сохранены в GitHub');
            return true;
        } else {
            console.log('Ошибка сохранения:', await updateResponse.text());
            return false;
        }
    } catch (error) {
        console.log('Ошибка сохранения:', error);
        return false;
    }
}

// Добавление новой задачи
async function addTask() {
    const taskInput = document.getElementById('taskInput');
    const assignTo = document.getElementById('assignTo');
    const difficulty = document.getElementById('difficulty');
    
    const text = taskInput.value.trim();
    if (!text) {
        showNotification('Введите текст задачи!');
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
    
    if (await saveTasksToGitHub()) {
        taskInput.value = '';
        showNotification('Задача добавлена! 🎉');
        renderTasks();
    } else {
        showNotification('Ошибка сохранения в GitHub!');
        tasks.pop();
    }
}

// Удаление задачи
async function deleteTask(taskId) {
    if (confirm('Удалить эту задачу?')) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            const deletedTask = tasks.splice(taskIndex, 1)[0];
            
            if (await saveTasksToGitHub()) {
                showNotification('Задача удалена! 🗑️');
                renderTasks();
            } else {
                showNotification('Ошибка удаления!');
                tasks.splice(taskIndex, 0, deletedTask);
            }
        }
    }
}

// Изменение статуса задачи
async function changeStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const oldStatus = task.status;
        task.status = newStatus;
        
        if (await saveTasksToGitHub()) {
            const statusNames = {
                'new': 'Новые',
                'inProgress': 'В работе', 
                'completed': 'Выполнено'
            };
            showNotification(`Задача перемещена в "${statusNames[newStatus]}"!`);
            renderTasks();
        } else {
            showNotification('Ошибка обновления!');
            task.status = oldStatus;
        }
    }
}

// Добавление комментария
async function addComment(taskId, commentText, author) {
    const task = tasks.find(t => t.id === taskId);
    if (task && commentText.trim()) {
        if (!task.comments) task.comments = [];
        task.comments.push({
            text: commentText.trim(),
            author: author,
            createdAt: new Date().toISOString()
        });
        
        if (await saveTasksToGitHub()) {
            showNotification('Комментарий добавлен! 💬');
            renderTasks();
        } else {
            showNotification('Ошибка добавления комментария!');
            task.comments.pop();
        }
    }
}

// Остальные функции
function renderTasks() {
    const containers = {
        new: document.getElementById('newTasks'),
        inProgress: document.getElementById('inProgressTasks'),
        completed: document.getElementById('completedTasks')
    };
    
    Object.values(containers).forEach(container => {
        container.innerHTML = '';
    });
    
    const sortedTasks = [...tasks].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    sortedTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        containers[task.status].appendChild(taskElement);
    });
    
    Object.values(containers).forEach(container => {
        if (container.children.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-state';
            emptyMsg.textContent = 'Пока нет задач';
            container.appendChild(emptyMsg);
        }
    });
}

function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${task.difficulty}`;
    taskDiv.id = `task-${task.id}`;
    
    const assigneeName = task.assignTo === 'ulyana' ? 'Ульяна' : 'Сережа';
    const assigneeClass = task.assignTo;
    const difficultyText = {
        'easy': '🟢 Простая',
        'medium': '🟡 Средняя', 
        'hard': '🔴 Сложная'
    };
    
    let commentsHTML = '';
    if (task.comments && task.comments.length > 0) {
        commentsHTML = `
            <div class="comments-section">
                <h4>Комментарии (${task.comments.length}):</h4>
                ${task.comments.map(comment => `
                    <div class="comment">
                        <div class="comment-author">${comment.author}:</div>
                        <div class="comment-text">${comment.text}</div>
                        <small>${formatTime(comment.createdAt)}</small>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    taskDiv.innerHTML = `
        <div class="task-header">
            <span class="task-assignee ${assigneeClass}">${assigneeName}</span>
            <span class="difficulty-badge ${task.difficulty}">${difficultyText[task.difficulty]}</span>
        </div>
        <div class="task-text">${task.text}</div>
        <div class="task-time">${formatTime(task.createdAt)}</div>
        
        <div class="task-actions">
            ${task.status !== 'new' ? `<button class="action-btn" onclick="changeStatus('${task.id}', 'new')">⬅️ Назад</button>` : ''}
            ${task.status !== 'inProgress' ? `<button class="action-btn" onclick="changeStatus('${task.id}', 'inProgress')">⏳ В работу</button>` : ''}
            ${task.status !== 'completed' ? `<button class="action-btn" onclick="changeStatus('${task.id}', 'completed')">✅ Выполнено</button>` : ''}
            <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')">🗑️ Удалить</button>
            <button class="action-btn comment-btn" onclick="toggleCommentInput('${task.id}')">💬 Комментировать</button>
        </div>
        
        ${commentsHTML}
        
        <div class="add-comment" id="comment-${task.id}" style="display: none;">
            <input type="text" class="comment-input" id="commentInput-${task.id}" placeholder="Ваш комментарий...">
            <button class="add-comment-btn" onclick="submitComment('${task.id}', 'Ульяна')">От Ульяны</button>
            <button class="add-comment-btn" onclick="submitComment('${task.id}', 'Сережа')">От Сережи</button>
        </div>
    `;
    
    return taskDiv;
}

function toggleCommentInput(taskId) {
    const commentDiv = document.getElementById(`comment-${taskId}`);
    commentDiv.style.display = commentDiv.style.display === 'none' ? 'flex' : 'none';
}

function submitComment(taskId, author) {
    const commentInput = document.getElementById(`commentInput-${taskId}`);
    const commentText = commentInput.value;
    addComment(taskId, commentText, author);
    commentInput.value = '';
    document.getElementById(`comment-${taskId}`).style.display = 'none';
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('ru-RU') + ' ' + 
           date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
}

document.getElementById('taskInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});
