import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ArrowRight,
  Trash2,
  FolderKanban,
  LogOut,
  Lock,
  Mail,
  Moon,
  Plus,
  Shield,
  Sparkles,
  Sun,
  User,
  Users
} from "lucide-react";
import "./styles.css";

const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");
const emptyProjectForm = { name: "", description: "", members: [] };
const emptyTaskForm = {
  title: "",
  description: "",
  project: "",
  assignedTo: "",
  dueDate: "",
  status: "todo"
};
const demoAccounts = {
  admin: {
    label: "Use Admin Demo",
    email: "Shubhamcuchd@gmail.com",
    password: "Shubham"
  },
  member: {
    label: "Use Member Demo",
    email: "Anand@gmail.com",
    password: "123456"
  }
};

function App() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("task-manager-auth");
    return saved ? JSON.parse(saved) : null;
  });
  const [theme, setTheme] = useState(() => localStorage.getItem("task-manager-theme") || "light");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const isAdmin = auth?.user?.role === "admin";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("task-manager-theme", theme);
  }, [theme]);

  const api = useMemo(
    () => async (path, options = {}) => {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
          ...options.headers
        }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      return data;
    },
    [auth?.token]
  );

  async function loadData() {
    if (!auth) return;
    setLoading(true);
    setMessage("");
    try {
      const [dashboardData, projectData, taskData, userData] = await Promise.all([
        api("/dashboard"),
        api("/projects"),
        api("/tasks"),
        isAdmin ? api("/auth/users") : Promise.resolve([])
      ]);
      setDashboard(dashboardData);
      setProjects(projectData);
      setTasks(taskData);
      setUsers(userData);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [auth?.token]);

  async function handleAuth(event) {
    event.preventDefault();
    if (actionLoading) return;
    setMessage("");
    setActionLoading("auth");
    try {
      const path = authMode === "login" ? "/auth/login" : "/auth/signup";
      const payload =
        authMode === "login"
          ? { email: authForm.email, password: authForm.password }
          : authForm;
      const data = await api(path, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      localStorage.setItem("task-manager-auth", JSON.stringify(data));
      setAuth(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setActionLoading("");
    }
  }

  function useDemoAccount(type) {
    const account = demoAccounts[type];
    setAuthMode("login");
    setAuthForm({
      name: "",
      email: account.email,
      password: account.password
    });
    setMessage("");
  }

  function logout() {
    localStorage.removeItem("task-manager-auth");
    setAuth(null);
    setDashboard(null);
    setProjects([]);
    setTasks([]);
    setUsers([]);
  }

  async function createProject(event) {
    event.preventDefault();
    if (actionLoading) return;
    setMessage("");
    setActionLoading("project");
    try {
      await api("/projects", {
        method: "POST",
        body: JSON.stringify(projectForm)
      });
      setProjectForm(emptyProjectForm);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setActionLoading("");
    }
  }

  async function createTask(event) {
    event.preventDefault();
    if (actionLoading) return;
    setMessage("");
    setActionLoading("task");
    try {
      await api("/tasks", {
        method: "POST",
        body: JSON.stringify(taskForm)
      });
      setTaskForm(emptyTaskForm);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setActionLoading("");
    }
  }

  async function updateTaskStatus(taskId, status) {
    if (actionLoading) return;
    setMessage("");
    setActionLoading(`status-${taskId}`);
    try {
      await api(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setActionLoading("");
    }
  }

  async function deleteTask(taskId) {
    if (actionLoading) return;
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    setMessage("");
    setActionLoading(`delete-${taskId}`);
    try {
      await api(`/tasks/${taskId}`, {
        method: "DELETE"
      });
      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setActionLoading("");
    }
  }

  function toggleProjectMember(userId) {
    setProjectForm((current) => {
      const exists = current.members.includes(userId);
      return {
        ...current,
        members: exists
          ? current.members.filter((id) => id !== userId)
          : [...current.members, userId]
      };
    });
  }

  const selectedProject = projects.find((project) => project._id === taskForm.project);
  const assignableUsers = selectedProject?.members || users.filter((user) => user.role === "member");

  if (!auth) {
    return (
      <main className="auth-shell">
        <section className="auth-panel">
          <div className="auth-story">
            <div className="brand-mark">
              <FolderKanban size={26} />
            </div>
            <p className="eyebrow">Team Task Manager</p>
            <h1>Plan work. Assign clearly. Ship faster.</h1>
            <p className="intro">
              A focused workspace for projects, team members, deadlines, and progress tracking.
            </p>
            <div className="auth-highlights">
              <span>
                <CheckCircle2 size={17} />
                JWT auth
              </span>
              <span>
                <Shield size={17} />
                Role access
              </span>
              <span>
                <Sparkles size={17} />
                Live dashboard
              </span>
            </div>
          </div>

          <form className="auth-form auth-card" onSubmit={handleAuth}>
            <div className="form-heading">
              <div>
                <p className="eyebrow">Welcome</p>
                <h2>{authMode === "login" ? "Login to your workspace" : "Create member account"}</h2>
              </div>
              <span className="secure-chip">
                <Lock size={14} />
                Secure
              </span>
            </div>

            <div className="segmented">
              <button
                type="button"
                className={authMode === "login" ? "active" : ""}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === "signup" ? "active" : ""}
                onClick={() => setAuthMode("signup")}
              >
                Signup
              </button>
            </div>

            {authMode === "signup" && (
              <label>
                Name
                <div className="input-wrap">
                  <User size={18} />
                  <input
                    value={authForm.name}
                    onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                    placeholder="Your name"
                  />
                </div>
              </label>
            )}

            <label>
              Email
              <div className="input-wrap">
                <Mail size={18} />
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                  placeholder="you@example.com"
                />
              </div>
            </label>

            <label>
              Password
              <div className="input-wrap">
                <Lock size={18} />
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                  placeholder="Minimum 6 characters"
                />
              </div>
            </label>

            {message && <p className="message error">{message}</p>}
            <div className="demo-login">
              <span>Demo access</span>
              <div>
                <button type="button" onClick={() => useDemoAccount("admin")}>
                  {demoAccounts.admin.label}
                </button>
                <button type="button" onClick={() => useDemoAccount("member")}>
                  {demoAccounts.member.label}
                </button>
              </div>
            </div>
            <button className="primary-button" type="submit">
              {actionLoading === "auth"
                ? "Please wait..."
                : authMode === "login"
                  ? "Login"
                  : "Create account"}
              <ArrowRight size={18} />
            </button>
            <p className="auth-note">
              New signups become members. Admin access is created from the server seed command.
            </p>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Team workspace</p>
          <h1>Task Manager</h1>
        </div>
        <div className="user-chip">
          <Shield size={18} />
          <span>{auth.user.name}</span>
          <strong>{auth.user.role}</strong>
          <button
            className="icon-button"
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-button" type="button" onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {message && <p className="message error">{message}</p>}
      {loading && <p className="message">Loading workspace...</p>}

      <section className="metric-grid">
        <Metric icon={<FolderKanban />} label="Projects" value={dashboard?.projectCount || 0} />
        <Metric icon={<ClipboardList />} label="Tasks" value={dashboard?.totalTasks || 0} />
        <Metric icon={<CalendarClock />} label="In Progress" value={dashboard?.inProgressTasks || 0} />
        <Metric icon={<CheckCircle2 />} label="Done" value={dashboard?.doneTasks || 0} />
      </section>

      <section className="workspace-grid">
        {isAdmin && (
          <div className="panel">
            <div className="panel-heading">
              <h2>Create Project</h2>
              <Plus size={18} />
            </div>
            <form onSubmit={createProject} className="stack-form">
              <label>
                Project name
                <input
                  value={projectForm.name}
                  onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })}
                  placeholder="Website launch"
                />
              </label>
              <label>
                Description
                <textarea
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm({ ...projectForm, description: event.target.value })
                  }
                  placeholder="Project goals and scope"
                />
              </label>
              <div>
                <span className="label-text">Team members</span>
                <div className="member-list">
                  {users.map((user) => (
                    <label className="checkbox-row" key={user._id}>
                      <input
                        type="checkbox"
                        checked={projectForm.members.includes(user._id)}
                        onChange={() => toggleProjectMember(user._id)}
                      />
                      <span>{user.name}</span>
                      <small>{user.role}</small>
                    </label>
                  ))}
                </div>
              </div>
              <button className="primary-button" type="submit" disabled={actionLoading === "project"}>
                {actionLoading === "project" ? "Creating..." : "Create project"}
              </button>
            </form>
          </div>
        )}

        {isAdmin && (
          <div className="panel">
            <div className="panel-heading">
              <h2>Create Task</h2>
              <ClipboardList size={18} />
            </div>
            <form onSubmit={createTask} className="stack-form">
              <label>
                Title
                <input
                  value={taskForm.title}
                  onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                  placeholder="Design dashboard"
                />
              </label>
              <label>
                Project
                <select
                  value={taskForm.project}
                  onChange={(event) =>
                    setTaskForm({ ...taskForm, project: event.target.value, assignedTo: "" })
                  }
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option value={project._id} key={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Assign to
                <select
                  value={taskForm.assignedTo}
                  onChange={(event) => setTaskForm({ ...taskForm, assignedTo: event.target.value })}
                >
                  <option value="">Select member</option>
                  {assignableUsers.map((user) => (
                    <option value={user._id} key={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Due date
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })}
                />
              </label>
              <label>
                Description
                <textarea
                  value={taskForm.description}
                  onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
                  placeholder="Task details"
                />
              </label>
              <button className="primary-button" type="submit" disabled={actionLoading === "task"}>
                {actionLoading === "task" ? "Creating..." : "Create task"}
              </button>
            </form>
          </div>
        )}

        <div className="panel wide">
          <div className="panel-heading">
            <h2>Projects</h2>
            <Users size={18} />
          </div>
          <div className="list">
            {projects.length === 0 && <p className="muted">No projects yet.</p>}
            {projects.map((project) => (
              <article className="project-card" key={project._id}>
                <div className="project-main">
                  <div className="project-icon">
                    <FolderKanban size={20} />
                  </div>
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.description || "No description"}</p>
                  </div>
                </div>

                <div className="project-members">
                  <span className="member-count">
                    <Users size={15} />
                    {project.members.length} member{project.members.length === 1 ? "" : "s"}
                  </span>
                  <div className="member-pills">
                    {project.members.map((member) => (
                      <span className="member-pill" key={member._id}>
                        <strong>{member.name.slice(0, 1).toUpperCase()}</strong>
                        <span>{member.name}</span>
                        <small>{member.role}</small>
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel wide">
          <div className="panel-heading">
            <h2>{isAdmin ? "All Tasks" : "My Tasks"}</h2>
            <CalendarClock size={18} />
          </div>
          <div className="task-list">
            {tasks.length === 0 && <p className="muted">No tasks yet.</p>}
            {tasks.map((task) => {
              const overdue = task.status !== "done" && new Date(task.dueDate) < new Date();
              return (
                <article className="task-item" key={task._id}>
                  <div>
                    <div className="task-title-row">
                      <h3>{task.title}</h3>
                      {overdue && <span className="badge danger">Overdue</span>}
                    </div>
                    <p>{task.description || "No description"}</p>
                    <small>
                      {task.project?.name} - {task.assignedTo?.name} - Due{" "}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="task-actions">
                    <select
                      value={task.status}
                      disabled={actionLoading === `status-${task._id}`}
                      onChange={(event) => updateTaskStatus(task._id, event.target.value)}
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    {isAdmin && (
                      <button
                        className="delete-button"
                        type="button"
                        disabled={actionLoading === `delete-${task._id}`}
                        onClick={() => deleteTask(task._id)}
                        title="Delete task"
                      >
                        <Trash2 size={17} />
                        {actionLoading === `delete-${task._id}` ? "Deleting" : "Delete"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

createRoot(document.getElementById("root")).render(<App />);
