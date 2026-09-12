(() => {
  const STORAGE_KEY = "todo-app-items";

  const addForm = document.getElementById("addForm");
  const todoInput = document.getElementById("todoInput");
  const todoList = document.getElementById("todoList");
  const emptyState = document.getElementById("emptyState");
  const itemsLeft = document.getElementById("itemsLeft");
  const clearCompletedBtn = document.getElementById("clearCompleted");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const dateLabel = document.getElementById("dateLabel");

  let todos = loadTodos();
  let currentFilter = "all";

  dateLabel.textContent = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function addTodo(text) {
    todos.unshift({ id: genId(), text, completed: false });
    saveTodos();
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos();
      render();
    }
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    render();
  }

  function editTodo(id, newText) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const trimmed = newText.trim();
    if (trimmed === "") {
      deleteTodo(id);
      return;
    }
    todo.text = trimmed;
    saveTodos();
    render();
  }

  function clearCompleted() {
    todos = todos.filter((t) => !t.completed);
    saveTodos();
    render();
  }

  function getFilteredTodos() {
    if (currentFilter === "active") return todos.filter((t) => !t.completed);
    if (currentFilter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }

  function startEditing(li, todo) {
    const textEl = li.querySelector(".todo-text");
    const input = document.createElement("input");
    input.type = "text";
    input.className = "todo-text-input";
    input.value = todo.text;
    input.maxLength = 200;
    textEl.replaceWith(input);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    let finished = false;
    const finish = (commit) => {
      if (finished) return;
      finished = true;
      if (commit) editTodo(todo.id, input.value);
      else render();
    };

    input.addEventListener("blur", () => finish(true));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") finish(true);
      if (e.key === "Escape") finish(false);
    });
  }

  function render() {
    const filtered = getFilteredTodos();
    todoList.innerHTML = "";

    filtered.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (todo.completed ? " completed" : "");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "todo-checkbox";
      checkbox.checked = todo.completed;
      checkbox.addEventListener("change", () => toggleTodo(todo.id));

      const textEl = document.createElement("span");
      textEl.className = "todo-text";
      textEl.textContent = todo.text;
      textEl.addEventListener("dblclick", () => startEditing(li, todo));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "✕";
      deleteBtn.setAttribute("aria-label", "削除");
      deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

      li.append(checkbox, textEl, deleteBtn);
      todoList.appendChild(li);
    });

    emptyState.hidden = filtered.length !== 0;

    const remaining = todos.filter((t) => !t.completed).length;
    itemsLeft.textContent = `${remaining} 件残り`;
  }

  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text === "") return;
    addTodo(text);
    todoInput.value = "";
    todoInput.focus();
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  render();
})();
