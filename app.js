class TodoApp {
    constructor() {
        this.taskInput = document.getElementById('task-input');
        this.labelSelect = document.getElementById('label-select');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.statusFilter = document.getElementById('status-filter');
        this.labelFilter = document.getElementById('label-filter');
        this.themeToggle = document.getElementById('theme-toggle');
        this.langToggle = document.getElementById('lang-toggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.currentLang = localStorage.getItem('lang') || 'ja';
        this.tasks = [];

        this.translations = {
            ja: {
                'app.title': 'ToDo アプリ',
                'task.input.placeholder': '新しいタスクを入力...',
                'task.add': '追加',
                'filter.status': 'ステータスでフィルター',
                'filter.label': 'ラベルでフィルター',
                'filter.all': 'すべてのラベル',
                'status.todo': '未着手',
                'status.in_progress': '進行中',
                'status.done': '完了',
                'label.todo': '未着手',
                'label.in_progress': '進行中',
                'label.done': '完了',
                'completion.title': '🎉 おめでとうございます！ 🎉',
                'completion.message': 'すべてのタスクが完了しました！',
                'completion.continue': '続ける'
            },
            en: {
                'app.title': 'Todo App',
                'task.input.placeholder': 'Enter new task...',
                'task.add': 'Add',
                'filter.status': 'Filter by Status',
                'filter.label': 'Filter by Label',
                'filter.all': 'All Labels',
                'status.todo': 'To Do',
                'status.in_progress': 'In Progress',
                'status.done': 'Done',
                'label.todo': 'To Do',
                'label.in_progress': 'In Progress',
                'label.done': 'Done',
                'completion.title': '🎉 Congratulations! 🎉',
                'completion.message': 'All tasks have been completed!',
                'completion.continue': 'Continue'
            },
            zh: {
                'app.title': '待办事项应用',
                'task.input.placeholder': '输入新任务...',
                'task.add': '添加',
                'filter.status': '按状态筛选',
                'filter.label': '按标签筛选',
                'filter.all': '所有标签',
                'status.todo': '待办',
                'status.in_progress': '进行中',
                'status.done': '已完成',
                'label.todo': '待办',
                'label.in_progress': '进行中',
                'label.done': '已完成',
                'completion.title': '🎉 恭喜！ 🎉',
                'completion.message': '所有任务都已完成！',
                'completion.continue': '继续'
            }
        };

        this.init();
    }

    async init() {
        this.setupTheme();
        this.setupEventListeners();
        await this.loadTasks();
        this.updateLabelFilter();
        this.setupDragAndDrop();
        this.updateLanguage();
    }

    setupTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        this.themeToggle.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        this.themeToggle.setAttribute('title', this.currentTheme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え');
    }

    setupEventListeners() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        this.statusFilter.addEventListener('change', () => this.filterTasks());
        this.labelFilter.addEventListener('change', () => this.filterTasks());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // 言語切り替えボタンのイベントリスナー
        document.getElementById('lang-ja').addEventListener('click', () => this.setLanguage('ja'));
        document.getElementById('lang-en').addEventListener('click', () => this.setLanguage('en'));
        document.getElementById('lang-zh').addEventListener('click', () => this.setLanguage('zh'));
    }

    setupDragAndDrop() {
        const taskItems = document.querySelectorAll('.task-item');
        const taskLists = document.querySelectorAll('.task-list');

        taskItems.forEach(item => {
            item.addEventListener('dragstart', () => {
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });

        taskLists.forEach(list => {
            list.addEventListener('dragover', e => {
                e.preventDefault();
                const draggingItem = document.querySelector('.dragging');
                if (draggingItem) {
                    const afterElement = this.getDragAfterElement(list, e.clientY);
                    if (afterElement) {
                        list.insertBefore(draggingItem, afterElement);
                    } else {
                        list.appendChild(draggingItem);
                    }
                }
            });

            list.addEventListener('drop', async e => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = list.closest('.task-group').dataset.status;
                await this.updateTaskStatus(taskId, newStatus);
            });
        });
    }

    async addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;

        const selectedStatus = this.labelSelect.value;

        const task = {
            id: Date.now().toString(),
            text,
            status: selectedStatus,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        await this.saveTasks();
        this.renderTasks();
        
        // 入力フィールドをクリア
        this.taskInput.value = '';
        // ラベルをデフォルト（todo）に戻す
        this.labelSelect.value = 'todo';

        // タスク追加時のアニメーション
        const taskElement = document.querySelector(`[data-id="${task.id}"]`);
        if (taskElement) {
            taskElement.classList.add('animate__animated', 'animate__fadeIn');
        }
    }

    async saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    async loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
        this.renderTasks();
    }

    updateLabelFilter() {
        const options = ['<option value="all">' + this.translations[this.currentLang]['filter.all'] + '</option>'];
        const labels = ['todo', 'in_progress', 'done'];
        labels.forEach(label => {
            options.push(`<option value="${label}">${this.translations[this.currentLang][`label.${label}`]}</option>`);
        });
        this.labelFilter.innerHTML = options.join('');
    }

    async filterTasks() {
        const status = this.statusFilter.value;
        const labelId = this.labelFilter.value;
        let tasks;

        if (status === 'all' && labelId === 'all') {
            tasks = await db.getAllTasks();
        } else if (status !== 'all' && labelId === 'all') {
            tasks = await db.getTasksByStatus(status);
        } else if (status === 'all' && labelId !== 'all') {
            tasks = await db.getTasksByLabel(labelId);
        } else {
            const statusTasks = await db.getTasksByStatus(status);
            const labelTasks = await db.getTasksByLabel(labelId);
            tasks = statusTasks.filter(task => 
                labelTasks.some(labelTask => labelTask.id === task.id)
            );
        }

        this.renderTasks(tasks);
    }

    renderTasks(tasks) {
        const todoList = document.getElementById('todo-list');
        const inProgressList = document.getElementById('in-progress-list');
        const doneList = document.getElementById('done-list');

        // 各リストをクリア
        [todoList, inProgressList, doneList].forEach(list => {
            if (list) list.innerHTML = '';
        });

        // タスクをステータスごとに分類して表示
        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            const targetList = document.getElementById(`${task.status}-list`);
            if (targetList) {
                targetList.appendChild(taskElement);
            }
        });

        this.setupTaskEventListeners();
        this.setupDragAndDrop();
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item status-${task.status}`;
        taskElement.dataset.id = task.id;
        taskElement.draggable = true;

        taskElement.innerHTML = `
            <div class="task-content">
                <span class="task-text">${task.text}</span>
                <div class="task-labels">
                    <span class="task-label status-label" data-status="${task.status}">
                        ${this.translations[this.currentLang][`status.${task.status}`]}
                    </span>
                </div>
            </div>
            <button class="delete-btn" title="${this.currentLang === 'ja' ? '削除' : 'Delete'}">×</button>
        `;

        return taskElement;
    }

    setupTaskEventListeners() {
        document.querySelectorAll('.task-item').forEach(item => {
            const deleteBtn = item.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', async () => {
                const taskId = item.dataset.id;
                item.classList.add('deleting');
                await new Promise(resolve => setTimeout(resolve, 300));
                this.tasks = this.tasks.filter(task => task.id !== taskId);
                await this.saveTasks();
                this.renderTasks();
            });
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    async updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const taskElement = document.querySelector(`[data-id="${taskId}"]`);
            if (taskElement) {
                taskElement.classList.add('status-changing');
                setTimeout(() => {
                    taskElement.classList.remove('status-changing');
                }, 500);
            }

            task.status = newStatus;
            await this.saveTasks();
            this.renderTasks();

            const allDone = this.tasks.every(t => t.status === 'done');
            if (allDone && this.tasks.length > 0) {
                showCompletionMessage();
            }
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        document.body.setAttribute('data-theme', this.currentTheme);
        this.themeToggle.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        this.themeToggle.setAttribute('title', this.currentTheme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え');
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('lang', lang);
        this.updateLanguage();
    }

    updateLanguage() {
        document.querySelector('h1').textContent = this.translations[this.currentLang]['app.title'];
        this.taskInput.placeholder = this.translations[this.currentLang]['task.input.placeholder'];
        this.addTaskBtn.textContent = this.translations[this.currentLang]['task.add'];
        
        // ステータスフィルターの更新
        const statusOptions = [
            `<option value="all">${this.translations[this.currentLang]['filter.all']}</option>`,
            `<option value="todo">${this.translations[this.currentLang]['status.todo']}</option>`,
            `<option value="in_progress">${this.translations[this.currentLang]['status.in_progress']}</option>`,
            `<option value="done">${this.translations[this.currentLang]['status.done']}</option>`
        ];
        this.statusFilter.innerHTML = statusOptions.join('');

        // タスクグループのタイトル更新
        document.querySelector('[data-status="todo"] h2').textContent = this.translations[this.currentLang]['status.todo'];
        document.querySelector('[data-status="in_progress"] h2').textContent = this.translations[this.currentLang]['status.in_progress'];
        document.querySelector('[data-status="done"] h2').textContent = this.translations[this.currentLang]['status.done'];

        // 完了メッセージの更新
        const completionMessage = document.getElementById('completion-message');
        if (completionMessage) {
            completionMessage.querySelector('h2').textContent = this.translations[this.currentLang]['completion.title'];
            completionMessage.querySelector('p').textContent = this.translations[this.currentLang]['completion.message'];
            completionMessage.querySelector('button').textContent = this.translations[this.currentLang]['completion.continue'];
        }

        // タスクの再レンダリング
        this.renderTasks();
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// 完了メッセージの表示/非表示
function showCompletionMessage() {
    const message = document.getElementById('completion-message');
    message.classList.add('show');
}

function hideCompletionMessage() {
    const message = document.getElementById('completion-message');
    message.classList.remove('show');
} 