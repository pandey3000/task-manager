import Project from "../models/Project.js";
import Task from "../models/Task.js";

function projectQueryFor(user) {
  if (user.role === "admin") return {};
  return { members: user._id };
}

export async function getProjects(req, res, next) {
  try {
    const projects = await Project.find(projectQueryFor(req.user))
      .populate("owner", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
}

export async function createProject(req, res, next) {
  try {
    const { name, description, members = [] } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const memberSet = new Set([...members, String(req.user._id)]);
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [...memberSet]
    });

    const populated = await project.populate([
      { path: "owner", select: "name email role" },
      { path: "members", select: "name email role" }
    ]);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    const { name, description, members } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.name = name ?? project.name;
    project.description = description ?? project.description;
    if (Array.isArray(members)) {
      project.members = [...new Set([...members, String(project.owner)])];
    }

    await project.save();
    const populated = await project.populate([
      { path: "owner", select: "name email role" },
      { path: "members", select: "name email role" }
    ]);

    res.json(populated);
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
}
