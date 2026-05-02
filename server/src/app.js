import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Team Task Manager API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  res.status(status).json({
    message: error.message || "Server error"
  });
});

export default app;
