import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  reportTaskIssue,
  resolveTaskIssue,
  updateTask
} from "../controllers/taskController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getTasks);
router.post("/", protect, adminOnly, createTask);
router.put("/:id", protect, updateTask);
router.post("/:id/issue", protect, reportTaskIssue);
router.put("/:id/issue/resolve", protect, adminOnly, resolveTaskIssue);
router.delete("/:id", protect, adminOnly, deleteTask);

export default router;
