import Project from "../models/Project.js";
import Task from "../models/Task.js";

async function canAccessProject(projectId, user) {
  const project = await Project.findById(projectId);
  if (!project) return false;
  if (user.role === "admin") return true;
  return project.members.some((id) => String(id) === String(user._id));
}

function taskQueryFor(user) {
  if (user.role === "admin") return {};
  return { assignedTo: user._id };
}

export async function getTasks(req, res, next) {
  try {
    const tasks = await Task.find(taskQueryFor(req.user))
      .populate("project", "name")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    const { title, description, project, assignedTo, dueDate, status } = req.body;

    if (!title || !project || !assignedTo || !dueDate) {
      return res.status(400).json({ message: "Title, project, assignee, and due date are required" });
    }

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = projectDoc.members.some((id) => String(id) === String(assignedTo));
    if (!isMember) {
      return res.status(400).json({ message: "Assignee must be a project member" });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      dueDate,
      status,
      createdBy: req.user._id
    });

    const populated = await task.populate([
      { path: "project", select: "name" },
      { path: "assignedTo", select: "name email role" },
      { path: "createdBy", select: "name email role" }
    ]);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isAssignedMember = String(task.assignedTo) === String(req.user._id);
    if (req.user.role !== "admin" && !isAssignedMember) {
      return res.status(403).json({ message: "You can update only your assigned tasks" });
    }

    const { title, description, project, assignedTo, dueDate, status } = req.body;

    if (req.user.role === "admin") {
      if (project && !(await canAccessProject(project, req.user))) {
        return res.status(404).json({ message: "Project not found" });
      }

      task.title = title ?? task.title;
      task.description = description ?? task.description;
      task.project = project ?? task.project;
      task.assignedTo = assignedTo ?? task.assignedTo;
      task.dueDate = dueDate ?? task.dueDate;
    }

    if (status) {
      task.status = status;
    }

    await task.save();
    const populated = await task.populate([
      { path: "project", select: "name" },
      { path: "assignedTo", select: "name email role" },
      { path: "createdBy", select: "name email role" }
    ]);

    res.json(populated);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
}
