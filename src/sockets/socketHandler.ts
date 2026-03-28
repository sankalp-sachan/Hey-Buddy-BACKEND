import { Server, Socket } from "socket.io";
import User from "../models/User";
import Message from "../models/Message";
import Chat from "../models/Chat";

export const socketHandler = (io: Server) => {
  const onlineUsers = new Map(); // userId -> socketId

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join App: Set user as online
    socket.on("setup", async (userData) => {
      if (!userData || !userData.id) return;
      socket.join(userData.id);
      onlineUsers.set(userData.id, socket.id);
      
      await User.findByIdAndUpdate(userData.id, { status: "online" });
      socket.emit("connected");
      console.log(`👤 User ${userData.username} is setup`);
    });

    // Join Chat Room
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log(`🏠 User joined room: ${room}`);
    });

    // Typing Indicators
    socket.on("typing", (room) => socket.in(room).emit("typing", room));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing", room));

    // New Message
    socket.on("new message", (newMessageRecieved) => {
      const chat = newMessageRecieved.chatId;
      if (!chat || !chat.participants) return console.log("Chat participants not defined");

      chat.participants.forEach((user: any) => {
        const userId = typeof user === "string" ? user : user._id;
        if (userId === newMessageRecieved.senderId._id) return;
        
        socket.in(userId).emit("message recieved", newMessageRecieved);
      });
    });

    // Message Seen
    socket.on("message seen", async ({ messageId, userId, chatId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { status: "seen" });
        socket.in(chatId).emit("message seen update", { messageId, status: "seen" });
      } catch (error) {
        console.error("Error updating message seen status:", error);
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      let disconnectedUserId = "";
      
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        await User.findByIdAndUpdate(disconnectedUserId, {
          status: "offline",
          lastSeen: new Date(),
        });
      }
    });
  });
};
