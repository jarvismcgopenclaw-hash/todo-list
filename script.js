const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
let client;

document.addEventListener("DOMContentLoaded", function () {
  client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");

  taskForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText === "") return;

    const { error } = await client
      .from("tasks")
      .insert([{ name: taskText }]);

    if (error) {
      console.error("Error al crear tarea:", error);
      alert("Error: " + error.message);
      return;
    }

    taskInput.value = "";
    taskInput.focus();
    loadTasks();
  });

  loadTasks();
});

async function loadTasks() {
  const { data, error } = await client
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error al cargar tareas:", error);
    alert("Error al cargar: " + error.message);
    return;
  }

  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";
  data.forEach(task => renderTask(task));
}

function renderTask(task) {
  const taskList = document.getElementById("task-list");
  const li = document.createElement("li");
  li.dataset.id = task.id;
  if (task.is_completed) li.classList.add("completed");

  const span = document.createElement("span");
  span.textContent = task.name;
  span.addEventListener("click", async () => {
    await client
      .from("tasks")
      .update({ is_completed: !task.is_completed })
      .eq("id", task.id);
    loadTasks();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Eliminar";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.addEventListener("click", async () => {
    await client
      .from("tasks")
      .delete()
      .eq("id", task.id);
    loadTasks();
  });

  li.appendChild(span);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}
