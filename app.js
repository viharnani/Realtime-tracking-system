const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("A user connected");

    // Listen for 'send-location' event from a client
    socket.on("send-location", (data) => {
        // Broadcast the location to all other connected clients
        socket.broadcast.emit("receive-location", data);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

app.get("/", (req, res) => {
    res.render("index");
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
