let tasks = [];

const API = "/api/tasks";

async function loadTasks() {
  const response = await fetch(API);
  tasks = await response.json();

  renderTasks();
  updateStats();
}

function renderTasks() {
  const list = document.getElementById("taskList");

  const search = document.getElementById("searchInput").value.toLowerCase();

  const status = document.getElementById("filterStatus").value;
  const priority = document.getElementById("filterPriority").value;

  const filtered = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search) ||
      task.description.toLowerCase().includes(search);

    const matchesStatus = status === "all" || task.status === status;

    const matchesPriority = priority === "all" || task.priority === priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  document.getElementById("taskCount").textContent = `${filtered.length} task${
    filtered.length !== 1 ? "s" : ""
  }`;

  if (filtered.length === 0) {
    list.innerHTML = `
            <div class="empty">
                <h3>No tasks found</h3>
                <p>Try changing your filters or create a new task.</p>
            </div>
        `;
    return;
  }

  list.innerHTML = filtered
    .map(
      (task) => `

        <div class="task">

            <div>
                <h3>${escapeHTML(task.title)}</h3>
                <p>${escapeHTML(task.description)}</p>
                <small>Created ${task.createdAt}</small>
            </div>

            <div class="task-right">

                <span class="badge ${task.priority}">
                    ${task.priority.toUpperCase()}
                </span>

                <select
                    class="status-select"
                    onchange="updateStatus(${task.id}, this.value)"
                >
                    <option value="pending"
                        ${task.status === "pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="in-progress"
                        ${task.status === "in-progress" ? "selected" : ""}>
                        In Progress
                    </option>

                    <option value="completed"
                        ${task.status === "completed" ? "selected" : ""}>
                        Completed
                    </option>
                </select>

                <button
                    class="edit-btn"
                    onclick="editTask(${task.id})">
                    ✏️
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask(${task.id})">
                    🗑
                </button>

            </div>

        </div>

    `
    )
    .join("");
}

function updateStats() {
  document.getElementById("totalTasks").textContent = tasks.length;

  document.getElementById("pendingTasks").textContent = tasks.filter(
    (t) => t.status === "pending"
  ).length;

  document.getElementById("progressTasks").textContent = tasks.filter(
    (t) => t.status === "in-progress"
  ).length;

  document.getElementById("completedTasks").textContent = tasks.filter(
    (t) => t.status === "completed"
  ).length;

  const completed = tasks.filter(
    t => t.status === "completed"
).length;

const progress = tasks.length === 0
    ? 0
    : Math.round((completed / tasks.length) * 100);

document.getElementById("progressPercent").textContent =
    `${progress}%`;

document.getElementById("progressFill").style.width =
    `${progress}%`;
}

async function createTask(event) {
  event.preventDefault();

  const title = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDescription").value;
  const priority = document.getElementById("taskPriority").value;

  await fetch(API, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      title,
      description,
      priority,
    }),
  });

  document.getElementById("taskForm").reset();

  closeModal();

  await loadTasks();
}

async function updateStatus(id, status) {
  await fetch(`${API}/${id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({ status }),
  });

  await loadTasks();
}

async function deleteTask(id) {
  if (!confirm("Delete this task?")) {
    return;
  }

  await fetch(`${API}/${id}`, {
    method: "DELETE",
  });

  await loadTasks();
}

async function editTask(id) {

    const task = tasks.find(t => t.id === id);

    if (!task) return;

    const newTitle = prompt("Task title:", task.title);

    if (newTitle === null || newTitle.trim() === "") {
        return;
    }

    const newDescription = prompt(
        "Task description:",
        task.description
    );

    const newPriority = prompt(
        "Priority (low / medium / high):",
        task.priority
    );

    const priority = ["low", "medium", "high"].includes(newPriority)
        ? newPriority
        : task.priority;

    await fetch(`${API}/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title: newTitle.trim(),
            description: newDescription || "",
            priority: priority
        })
    });

    await loadTasks();
}

function openModal() {
  document.getElementById("taskModal").classList.add("active");
}

function closeModal() {
  document.getElementById("taskModal").classList.remove("active");
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;

  return div.innerHTML;
}

document.getElementById("taskForm").addEventListener("submit", createTask);

loadTasks();
