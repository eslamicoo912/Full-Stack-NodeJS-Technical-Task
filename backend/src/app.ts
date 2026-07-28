import express, { Application, Request, Response } from "express";
import { notFoundHandler, errorHandler } from "./shared/middleware/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import projectRoutes from "./modules/project/project.routes";

const app: Application = express();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health-check", (req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "Server is running" });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// --- Error handling (must stay after all routes) ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
