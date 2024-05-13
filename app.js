import { Server } from "socket.io";
import { createServer } from "http";
import "dotenv/config";
import express from "express";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

let onlineUsers = [];

const addUser = (userId, socketId) => {
  const isExist = onlineUsers?.find((user) => user.userId === userId);
  if (!isExist) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (!receiver) return;
    io.to(receiver.socketId).emit("getMessage", data);
  });
  socket.on("updateMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (!receiver) return;
    io.to(receiver.socketId).emit("getStatusMessage", data);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

httpServer.listen(8081, () => {
  console.log("socket is running");
});
