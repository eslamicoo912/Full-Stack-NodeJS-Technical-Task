import app from "./app";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDatabase } from "./database/connection";
import { env } from "./shared/config/env";

dotenv.config();

const PORT = env.PORT;

// Create HTTP server and attach Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.CLIENT_URL,
  },
});

// Export io instance for use in controllers
export { io };

// Handle socket connections
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join project rooms for real-time updates
  socket.on("join-project", (projectId: string) => {
    socket.join(`project:${projectId}`);
  });

  socket.on("leave-project", (projectId: string) => {
    socket.leave(`project:${projectId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

connectDatabase().then(() => {
  httpServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});
