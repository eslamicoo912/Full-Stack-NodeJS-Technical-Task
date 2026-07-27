import express, { Application, Request, Response } from "express";

const app: Application = express();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health-check", (req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "Server is running" });
});

export default app;
