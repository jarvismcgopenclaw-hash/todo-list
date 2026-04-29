const SUPABASE_URL = "https://vdvcnephezrprclpzokl.supabase.co";
const SUPABASE_KEY = "sb_publishable_abAOT-XjCiQTtqMJclU97Q_FX1uYUJF";
const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY);

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

loadTasks();

taskForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const taskText = taskInput.value.trim();
  if (taskText === "") return;

  const { error } = await supabase
    .from("tasks")
    .insert([{ name: taskText }]);

  if (error) {
    console.error("Error al crear tarea:", error);
    return;
  }

  taskInput.value = "";
  taskInput.focus();
  loadTasks();
});

async function loadTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error al cargar tareas:", error);
    return;
  }

  taskList.innerHTML = "";
  data.forEach(task => renderTask(task));
}

function renderTask(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;
  if (task.is_completed) li.classList.add("completed");

  const span = document.createElement("span");
  span.textContent = task.name;
  span.addEventListener("click", async () => {
    await supabase
      .from("tasks")
      .update({ is_completed: !task.is_completed })
      .eq("id", task.id);
    loadTasks();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Eliminar";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.addEventListener("click", async () => {
    await supabase
      .from("tasks")
      .delete()
      .eq("id", task.id);
    loadTasks();
  });

  li.appendChild(span);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}
