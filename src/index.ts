import http from "http";
import { Server } from "socket.io";
import app from "./app";
import connectDB from "./config/db";
import dotenv from "dotenv";

import { socketHandler } from "./sockets/socketHandler";

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

connectDB();

// Initialize Sockets
socketHandler(io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export { io };
