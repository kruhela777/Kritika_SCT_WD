class InteractiveTodoApp {
  constructor() {
    this.tasks = [];
    this.currentFilter = 'all';
    this.dragSrcEl = null;
    this.editingTaskId = null;

    this.cacheDOMElements();
    this.bindEvents();
    this.loadFromStorage();
    this.render();
    this.startOverdueChecker();
  }

  cacheDOMElements() {
    this.taskForm = document.getElementById('taskForm');
    this.taskInput = document.getElementById('taskInput');
    this.taskDateTime = document.getElementById('taskDateTime');
    this.taskList = document.getElementById('taskList');
    this.emptyState = document.getElementById('emptyState');
    this.taskCount = document.getElementById('taskCount');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.clearCompletedBtn = document.getElementById('clearCompleted');
  }

  bindEvents() {
    this.taskForm.addEventListener('submit', (e) => this.handleAddTask(e));
    this.taskList.addEventListener('click', (e) => this.handleTaskClick(e));
    this.taskList.addEventListener('dblclick', (e) => this.handleTaskDblClick(e));
    this.taskList.addEventListener('keydown', (e) => this.handleTaskKeyDown(e));
    this.taskList.addEventListener('focusout', (e) => this.handleTaskFocusOut(e));
    this.taskList.addEventListener('dragstart', (e) => this.handleDragStart(e));
    this.taskList.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.taskList.addEventListener('drop', (e) => this.handleDrop(e));
    this.taskList.addEventListener('dragend', (e) => this.handleDragEnd(e));
    this.filterButtons.forEach((btn) => btn.addEventListener('click', (e) => this.handleFilterChange(e)));
    this.clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());
  }

  handleAddTask(e) {
    e.preventDefault();
    const text = this.taskInput.value.trim();
    const dateTime = this.taskDateTime.value;

    if (!text) return;

    this.tasks.unshift({
      id: Date.now().toString(),
      text,
      completed: false,
      dateTime: dateTime || null,
    });

    this.saveToStorage();
    this.render();

    this.taskForm.reset();
    this.taskInput.focus();
  }

  handleTaskClick(e) {
    const target = e.target;
    const taskItem = target.closest('.task-item');
    if (!taskItem) return;
    const taskId = taskItem.dataset.id;

    if (target.classList.contains('task-checkbox')) {
      this.toggleComplete(taskId);
    } else if (target.closest('.btn-delete')) {
      this.deleteTask(taskId);
    }
  }

  handleTaskDblClick(e) {
    const taskTextEl = e.target.closest('.task-text');
    if (!taskTextEl) return;
    this.enableEditing(taskTextEl);
  }

  handleTaskKeyDown(e) {
    if (e.target.classList.contains('task-text') && e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  }

  handleTaskFocusOut(e) {
    if (e.target.classList.contains('task-text') && e.target.isContentEditable) {
      this.saveEdit(e.target);
    }
  }

  enableEditing(taskTextEl) {
    if (this.editingTaskId) return; // Only one edit at a time
    this.editingTaskId = taskTextEl.closest('.task-item').dataset.id;
    taskTextEl.contentEditable = 'true';
    taskTextEl.classList.add('editing');
    taskTextEl.focus();

    // Place cursor at end
    document.execCommand('selectAll', false, null);
    document.getSelection().collapseToEnd();
  }

  saveEdit(taskTextEl) {
    const newText = taskTextEl.textContent.trim();
    if (!newText) {
      // If empty, revert to old text or delete task
      this.deleteTask(this.editingTaskId);
    } else {
      const task = this.tasks.find((t) => t.id === this.editingTaskId);
      if (task) {
        task.text = newText;
        this.saveToStorage();
        this.render();
      }
    }
    this.editingTaskId = null;
  }

  toggleComplete(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveToStorage();
      this.render();
    }
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.saveToStorage();
    this.render();
  }

  clearCompletedTasks() {
    this.tasks = this.tasks.filter((t) => !t.completed);
    this.saveToStorage();
    this.render();
  }

  handleFilterChange(e) {
    this.filterButtons.forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-checked', 'false');
    });
    e.target.classList.add('active');
    e.target.setAttribute('aria-checked', 'true');
    this.currentFilter = e.target.dataset.filter;
    this.render();
  }

  getFilteredTasks() {
    const now = new Date();
    switch (this.currentFilter) {
      case 'completed':
        return this.tasks.filter((t) => t.completed);
      case 'pending':
        return this.tasks.filter((t) => !t.completed);
      case 'overdue':
        return this.tasks.filter(
          (t) => t.dateTime && !t.completed && new Date(t.dateTime) < now
        );
      default:
        return this.tasks;
    }
  }

  formatDateTime(dateTime) {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const now = new Date();
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    const formatted = date.toLocaleDateString(undefined, options);
    if (date < now) {
      return `<span class="overdue"><i class="fas fa-exclamation-triangle"></i> Overdue: ${formatted}</span>`;
    }
    return `<span><i class="fas fa-calendar"></i> Due: ${formatted}</span>`;
  }

  render() {
    const filteredTasks = this.getFilteredTasks();

    // Update task count
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    this.taskCount.textContent = `${total} tasks (${completed} completed)`;

    // Show empty state if no tasks
    if (filteredTasks.length === 0) {
      this.emptyState.style.display = 'block';
      this.taskList.innerHTML = '';
      return;
    } else {
      this.emptyState.style.display = 'none';
    }

    // Render tasks with drag-and-drop attributes
    this.taskList.innerHTML = filteredTasks
      .map((task) => {
        const overdue =
          task.dateTime && !task.completed && new Date(task.dateTime) < new Date();
        return `
          <li class="task-item ${task.completed ? 'completed' : ''} ${
          overdue ? 'overdue' : ''
        }" draggable="true" data-id="${task.id}" tabindex="0" aria-label="${
          task.text
        } task${task.completed ? ', completed' : ''}${overdue ? ', overdue' : ''}">
            <input type="checkbox" class="task-checkbox" aria-checked="${
              task.completed
            }" ${task.completed ? 'checked' : ''} aria-label="Mark task as completed" />
            <div class="task-content">
              <div class="task-text" role="textbox" aria-multiline="false" tabindex="-1">${this.escapeHTML(
                task.text
              )}</div>
              ${
                task.dateTime
                  ? `<div class="task-datetime">${this.formatDateTime(task.dateTime)}</div>`
                  : ''
              }
            </div>
            <div class="task-actions">
              <button class="btn-edit" aria-label="Edit task">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-delete" aria-label="Delete task">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </li>
        `;
      })
      .join('');
  }

  escapeHTML(text) {
    return text.replace(/[&<>"']/g, (m) => {
      return (
        {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }[m] || m
      );
    });
  }

  saveToStorage() {
    localStorage.setItem('interactiveTodoTasks', JSON.stringify(this.tasks));
  }

  loadFromStorage() {
    const saved = localStorage.getItem('interactiveTodoTasks');
    if (saved) {
      this.tasks = JSON.parse(saved);
    }
  }

  // Drag and drop handlers
  handleDragStart(e) {
    if (!e.target.classList.contains('task-item')) return;
    this.dragSrcEl = e.target;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    e.target.classList.add('dragging');
  }

  handleDragOver(e) {
    e.preventDefault();
    if (!e.target.classList.contains('task-item')) return;
    const draggingEl = this.dragSrcEl;
    const targetEl = e.target.closest('.task-item');
    if (draggingEl === targetEl) return;

    const bounding = targetEl.getBoundingClientRect();
    const offset = e.clientY - bounding.top;
    const afterTarget = offset > bounding.height / 2;

    if (afterTarget) {
      targetEl.after(draggingEl);
    } else {
      targetEl.before(draggingEl);
    }
  }

  handleDrop(e) {
    e.preventDefault();
    if (!this.dragSrcEl) return;

    // Update tasks array order based on new DOM order
    const newOrderIds = Array.from(this.taskList.children).map((li) => li.dataset.id);
    this.tasks.sort((a, b) => newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id));
    this.saveToStorage();
    this.render();
    this.dragSrcEl.classList.remove('dragging');
    this.dragSrcEl = null;
  }

  handleDragEnd(e) {
    if (this.dragSrcEl) {
      this.dragSrcEl.classList.remove('dragging');
      this.dragSrcEl = null;
    }
  }

  // Periodically check overdue status and update UI
  startOverdueChecker() {
    setInterval(() => {
      if (this.tasks.length === 0) return;
      this.render();
    }, 60000); // every 1 minute
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new InteractiveTodoApp();
});
