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
        this.hasTasksInProgress = false;
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');
        this.completionMessage = document.getElementById('completion-message');
        this.closeCompletionBtn = document.querySelector('.close-completion-btn');

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

        // 完了メッセージを閉じるボタンのイベントリスナー
        this.closeCompletionBtn.addEventListener('click', () => this.hideCompletionMessage());
    }

    setupDragAndDrop() {
        const taskLists = document.querySelectorAll('.task-list');

        // 各タスクリストに対してドラッグ＆ドロップイベントを設定
        taskLists.forEach(list => {
            list.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.id);
                e.target.classList.add('dragging');
            });

            list.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });

            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                const draggingTask = document.querySelector('.dragging');
                if (draggingTask) {
                    const afterElement = this.getDragAfterElement(list, e.clientY);
                    if (afterElement) {
                        list.insertBefore(draggingTask, afterElement);
                    } else {
                        list.appendChild(draggingTask);
                    }
                }
            });

            list.addEventListener('drop', async (e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('text/plain');
                const task = document.getElementById(taskId);
                const newStatus = list.parentElement.dataset.status;
                
                // タスクのステータスを更新
                const taskIndex = this.tasks.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    this.tasks[taskIndex].status = newStatus;
                    await this.saveTasks();
                    
                    // タスクのラベルを更新
                    const statusLabel = task.querySelector('.status-label');
                    if (statusLabel) {
                        statusLabel.textContent = this.translations[this.currentLang][`status.${newStatus}`];
                        statusLabel.dataset.status = newStatus;
                    }
                    
                    // タスクのクラスを更新
                    task.className = `task-item status-${newStatus}`;
                    
                    // タスク移動後に完了チェックを実行
                    this.onTaskMoved();
                }
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
        
        // タスクを直接追加
        const taskElement = this.createTaskElement(task);
        const targetList = document.getElementById(`${selectedStatus}-list`);
        if (targetList) {
            targetList.appendChild(taskElement);
            taskElement.classList.add('animate__animated', 'animate__fadeIn');
        }
        
        // 入力フィールドをクリア
        this.taskInput.value = '';
        // ラベルをデフォルト（todo）に戻す
        this.labelSelect.value = 'todo';

        // タスクのイベントリスナーを設定
        this.setupTaskEventListeners();

        // タスクの追加時にフラグをリセット
        this.onTaskAdded();
        this.updateProgress();
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

    renderTasks(tasks = this.tasks) {
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

        // ドラッグ＆ドロップの設定を更新
        this.setupDragAndDrop();
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.id = task.id;
        taskElement.className = `task-item status-${task.status}`;
        taskElement.draggable = true;

        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';

        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;

        const statusLabel = document.createElement('span');
        statusLabel.className = 'status-label';
        statusLabel.textContent = this.translations[this.currentLang][`status.${task.status}`];
        statusLabel.dataset.status = task.status;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.innerHTML = '×';
        deleteButton.title = this.currentLang === 'ja' ? '削除' : 'Delete';
        deleteButton.addEventListener('click', () => this.deleteTask(task.id));

        taskContent.appendChild(taskText);
        taskContent.appendChild(statusLabel);
        taskElement.appendChild(taskContent);
        taskElement.appendChild(deleteButton);

        return taskElement;
    }

    setupTaskEventListeners() {
        // 削除ボタンのイベントリスナーを設定
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const taskElement = e.target.closest('.task-item');
                const taskId = taskElement.dataset.id;
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                await this.saveTasks();
                taskElement.remove();
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

    // タスクの完了状態をチェック
    checkAllTasksCompleted() {
        const todoList = document.getElementById('todo-list');
        const inProgressList = document.getElementById('in-progress-list');
        const doneList = document.getElementById('done-list');
        
        // 未着手または進行中にタスクがある場合、フラグを立てる
        if (todoList.children.length > 0 || inProgressList.children.length > 0) {
            this.hasTasksInProgress = true;
            console.log('Tasks in progress detected');
        }
        
        // 未着手と進行中のタスクがなく、完了タスクが1つ以上あり、
        // かつ以前に未着手または進行中のタスクがあった場合
        if (this.hasTasksInProgress && 
            todoList.children.length === 0 && 
            inProgressList.children.length === 0 && 
            doneList.children.length > 0) {
            console.log('All tasks completed, showing confetti');
            this.showCompletionMessage();
            this.hasTasksInProgress = false; // フラグをリセット
        }
    }

    // タスクの移動後に完了状態をチェック
    onTaskMoved() {
        console.log('Task moved, checking completion status');
        setTimeout(() => this.checkAllTasksCompleted(), 100);
        this.updateProgress();
    }

    // タスクの追加時にフラグをリセット
    onTaskAdded() {
        this.hasTasksInProgress = false;
        console.log('New task added, resetting progress flag');
    }

    // 完了メッセージの表示
    showCompletionMessage() {
        this.completionMessage.classList.remove('hidden');
        this.completionMessage.classList.add('visible');
        this.createConfetti();
    }

    hideCompletionMessage() {
        this.completionMessage.classList.remove('visible');
        setTimeout(() => {
            this.completionMessage.classList.add('hidden');
        }, 300);
    }

    createConfetti() {
        const confettiContainer = document.querySelector('.confetti-container');
        confettiContainer.innerHTML = '';
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confettiContainer.appendChild(confetti);
        }
    }

    async deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks.splice(taskIndex, 1);
            await this.saveTasks();
            const taskElement = document.getElementById(taskId);
            if (taskElement) {
                taskElement.remove();
                this.updateProgress();
            }
        }
    }

    updateProgress() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.status === 'done').length;
        const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        this.progressBar.style.width = `${progress}%`;
        this.progressText.textContent = `${progress}%`;

        if (progress === 100 && totalTasks > 0) {
            this.showCompletionMessage();
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// ケバブメニューの機能
document.addEventListener('DOMContentLoaded', function() {
    const kebabMenu = document.getElementById('kebab-menu');
    const kebabDropdown = document.getElementById('kebab-dropdown');

    // ケバブメニューの表示/非表示
    kebabMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        kebabDropdown.classList.toggle('hidden');
    });

    // ドロップダウンメニュー以外をクリックしたら閉じる
    document.addEventListener('click', function(e) {
        if (!kebabDropdown.contains(e.target) && e.target !== kebabMenu) {
            kebabDropdown.classList.add('hidden');
        }
    });
}); 