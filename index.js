const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

var Message = mongoose.model("Message", {
  room: String,
  author: String,
  message: String,
  time: String,
});

var dbUrl =
  "mongodb+srv://afrivalley:lameck@afrivalley.2mfkq.mongodb.net/chatApp?authSource=admin&replicaSet=atlas-p39ddc-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true";

const io = new Server(server, {
  cors: {
    origin: "https://master.d23s27u1alrnsq.amplifyapp.com",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Initial Route running");
});

app.get("/all-messages", async (req, res) => {
  const allMessages = await Message.find();
  res.status(200).json({
    status: "200",
    message: "Success",
    data: allMessages,
  });
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", async (data) => {
    var message = await Message({
      room: data.room,
      author: data.author,
      message: data.message,
      time: data.time,
    }).save();
    console.log("Created Database: ", message);
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

mongoose.connect(
  dbUrl,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log("mongodb connected", err);
  }
);

const port = process.env.PORT;

server.listen(port, () => {
  console.log("SERVER RUNNING");
});
