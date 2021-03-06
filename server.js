const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});
// above is port client runs on

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  // fetch existing users
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
  }
  socket.emit("users", users);

  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username,
  });

  // notify users upon disconnection
  socket.on("disconnect", () => {
    socket.broadcast.emit("user disconnected", socket.id);
  });

  socket.onAny((event, ...args) => {
    console.log(event, args);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () =>
console.log(`server listening at http://localhost:${PORT}`)
);
