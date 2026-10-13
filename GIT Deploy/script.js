// To-do list logic. Tasks are saved in the browser's localStorage.

const STORAGE_KEY = "todo-tasks-v1";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyMsg = document.getElementById("empty");
const summary = document.getElementById("summary");
const clearBtn = document.getElementById("clear-done");
const filterBtns = document.querySelectorAll(".filter");

let tasks = load();
let filter = "all";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage unavailable; the list still works for this session.
  }
}

function addTask(text) {
  tasks.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, done: false });
  save();
  render();
}

function toggleTask(id) {
  const t = tasks.find((t) => t.id === id);
  if (t) t.done = !t.done;
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

function updateText(id, text) {
  const trimmed = text.trim();
  if (!trimmed) return deleteTask(id);
  const t = tasks.find((t) => t.id === id);
  if (t) t.text = trimmed;
  save();
  render();
}

function startEdit(li, task) {
  const textEl = li.querySelector(".text");
  const editor = document.createElement("input");
  editor.type = "text";
  editor.className = "edit";
  editor.value = task.text;
  editor.maxLength = 200;
  editor.setAttribute("aria-label", "Edit task");
  textEl.replaceWith(editor);
  editor.focus();
  editor.select();

  let finished = false;
  const finish = (commit) => {
    if (finished) return;
    finished = true;
    commit ? updateText(task.id, editor.value) : render();
  };
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
  editor.addEventListener("blur", () => finish(true));
}

function render() {
  const visible = tasks.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done
  );

  list.innerHTML = "";
  visible.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = task.done;
    check.setAttribute("aria-label", "Mark done: " + task.text);
    check.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "text";
    text.textContent = task.text;
    text.addEventListener("dblclick", () => startEdit(li, task));

    const del = document.createElement("button");
    del.className = "icon-btn";
    del.textContent = "Delete";
    del.setAttribute("aria-label", "Delete task: " + task.text);
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(check, text, del);
    list.appendChild(li);
  });

  // Empty state
  if (visible.length === 0) {
    emptyMsg.hidden = false;
    emptyMsg.textContent =
      tasks.length === 0
        ? "No tasks yet. Type one above and press Enter."
        : filter === "done"
        ? "Nothing completed yet."
        : "All caught up. Nothing left to do.";
  } else {
    emptyMsg.hidden = true;
  }

  // Summary + footer
  const remaining = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.length - remaining;
  summary.textContent =
    tasks.length === 0
      ? "Nothing planned yet."
      : remaining === 0
      ? "Everything is done."
      : remaining + (remaining === 1 ? " task left" : " tasks left");
  clearBtn.hidden = doneCount === 0;

  filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = "";
  input.focus();
});

filterBtns.forEach((b) =>
  b.addEventListener("click", () => {
    filter = b.dataset.filter;
    render();
  })
);

clearBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.done);
  save();
  render();
});

render();
