document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const tasksLeftSpan = document.getElementById('tasks-left');
    const clearCompletedBtn = document.getElementById('clear-completed');
    
    // Tasks array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Initialize the app
    function init() {
        renderTasks();
        updateTasksLeft();
        setActiveFilter('all');
        taskInput.focus();
    }
    
    // Render tasks based on current filter
    function renderTasks(filter = 'all') {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        if (filter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li class="no-tasks">No tasks found</li>';
            return;
        }
        
        filteredTasks.forEach((task) => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;
            
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}
                       aria-label="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <button class="delete-btn" aria-label="Delete task"><i class="fas fa-trash"></i></button>
            `;
            
            taskList.appendChild(taskItem);
        });
        
        // Add event listeners to new elements
        addTaskEventListeners();
    }
    
    // Add event listeners to task elements
    function addTaskEventListeners() {
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const taskId = this.parentElement.dataset.id;
                toggleTaskCompleted(taskId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskId = this.parentElement.dataset.id;
                deleteTask(taskId);
            });
        });
    }
    
    // Add a new task
    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') {
            taskInput.focus();
            return;
        }
        
        const newTask = {
            id: Date.now().toString(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.unshift(newTask);
        saveTasks();
        renderTasks(getCurrentFilter());
        taskInput.value = '';
        taskInput.focus();
        updateTasksLeft();
    }
    
    // Toggle task completed status
    function toggleTaskCompleted(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveTasks();
        renderTasks(getCurrentFilter());
        updateTasksLeft();
    }
    
    // Delete a task
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks(getCurrentFilter());
        updateTasksLeft();
    }
    
    // Clear all completed tasks
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks(getCurrentFilter());
        updateTasksLeft();
    }
    
    // Update tasks left counter
    function updateTasksLeft() {
        const activeTasksCount = tasks.filter(task => !task.completed).length;
        tasksLeftSpan.textContent = `${activeTasksCount} ${activeTasksCount === 1 ? 'task' : 'tasks'} left`;
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Filter tasks
    function setActiveFilter(filter) {
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
                btn.setAttribute('aria-current', 'true');
            } else {
                btn.classList.remove('active');
                btn.removeAttribute('aria-current');
            }
        });
        
        renderTasks(filter);
    }
    
    // Get current active filter
    function getCurrentFilter() {
        const activeBtn = document.querySelector('.filter-btn.active');
        return activeBtn ? activeBtn.dataset.filter : 'all';
    }
    
    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            setActiveFilter(this.dataset.filter);
        });
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Touch device detection
    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    // Show delete buttons on touch devices
    if (isTouchDevice()) {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.style.opacity = '1';
        });
    }
    
    // Initialize the app
    init();
});