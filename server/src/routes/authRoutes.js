import { Router } from "express";
import { listUsers, login, me, signup } from "../controllers/authController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, me);
router.get("/users", protect, adminOnly, listUsers);

export default router;
