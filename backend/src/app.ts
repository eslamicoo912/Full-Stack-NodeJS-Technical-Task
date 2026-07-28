import express, { Application, Request, Response } from "express";
import cors from "cors";
import { env } from "./shared/config/env";
import { notFoundHandler, errorHandler } from "./shared/middleware/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import projectRoutes from "./modules/project/project.routes";
import taskRoutes from "./modules/task/task.routes";
import userRoutes from "./modules/user/user.routes";

const app: Application = express();

// --- Middleware ---
// allow the frontend origin to call the API (credentials not needed: JWT via header)
app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health-check", (req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "Server is running" });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);

// --- Error handling ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
