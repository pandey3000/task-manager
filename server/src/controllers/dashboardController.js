import Project from "../models/Project.js";
import Task from "../models/Task.js";

export async function getDashboard(req, res, next) {
  try {
    const now = new Date();
    const taskQuery = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const projectQuery = req.user.role === "admin" ? {} : { members: req.user._id };

    const [projectCount, totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks, openIssues] =
      await Promise.all([
        Project.countDocuments(projectQuery),
        Task.countDocuments(taskQuery),
        Task.countDocuments({ ...taskQuery, status: "todo" }),
        Task.countDocuments({ ...taskQuery, status: "in-progress" }),
        Task.countDocuments({ ...taskQuery, status: "done" }),
        Task.countDocuments({ ...taskQuery, status: { $ne: "done" }, dueDate: { $lt: now } }),
        Task.countDocuments({ ...taskQuery, "issue.status": "open" })
      ]);

    res.json({
      projectCount,
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      openIssues
    });
  } catch (error) {
    next(error);
  }
}
