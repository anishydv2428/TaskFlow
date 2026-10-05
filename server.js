const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

const DB_FILE = path.join(__dirname, "db.json");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

function readTasks() {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
}

function saveTasks(tasks) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ tasks }, null, 2));
}

// Get all tasks
app.get("/api/tasks", (req, res) => {
    const data = readTasks();
    res.json(data.tasks);
});

// Get single task
app.get("/api/tasks/:id", (req, res) => {
    const tasks = readTasks().tasks;
    const task = tasks.find(t => t.id === Number(req.params.id));

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
});

// Create task
app.post("/api/tasks", (req, res) => {
    const { title, description, priority } = req.body;

    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }

    const data = readTasks();

    const newTask = {
        id: Date.now(),
        title,
        description: description || "",
        priority: priority || "medium",
        status: "pending",
        createdAt: new Date().toISOString().split("T")[0]
    };

    data.tasks.push(newTask);
    saveTasks(data.tasks);

    res.status(201).json(newTask);
});

// Update task
app.put("/api/tasks/:id", (req, res) => {
    const data = readTasks();
    const id = Number(req.params.id);

    const index = data.tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Task not found" });
    }

    data.tasks[index] = {
        ...data.tasks[index],
        ...req.body,
        id
    };

    saveTasks(data.tasks);

    res.json(data.tasks[index]);
});

// Delete task
app.delete("/api/tasks/:id", (req, res) => {
    const data = readTasks();
    const id = Number(req.params.id);

    const newTasks = data.tasks.filter(task => task.id !== id);

    if (newTasks.length === data.tasks.length) {
        return res.status(404).json({ message: "Task not found" });
    }

    saveTasks(newTasks);

    res.json({ message: "Task deleted successfully" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`TaskFlow server running on port ${PORT}`);
});