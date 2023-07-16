
const PORT = process.env.PORT || 5000;


const express = require("express");
const app = express();
const io = require("socket.io")(PORT, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

// Connections
io.on("connection", (socket) => {
    console.log("User Connected");

    socket.on("canvas-data", (data) => {
        socket.broadcast.emit("canvas-data", data);
    });
});

app.get("/", (req, res) => {
    return res.send("Welcome");
});

