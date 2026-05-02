import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject
} from "../controllers/projectController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getProjects);
router.post("/", protect, adminOnly, createProject);
router.put("/:id", protect, adminOnly, updateProject);
router.delete("/:id", protect, adminOnly, deleteProject);

export default router;
