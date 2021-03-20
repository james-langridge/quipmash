const path = require('path');
const express = require("express");
const app = express();
const cors = require("cors");
const httpServer = require("http").createServer(app);
const IMAGE_URLS = require("./config/config").IMAGE_URLS;
const PORT = process.env.PORT || 5000;
const options = {
  cors: {
    origin: 'https://floating-reaches-30894.herokuapp.com',
    methods: ["GET", "POST"]
  }
};
// const options = {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ["GET", "POST"]
//   }
// };
const io = require("socket.io")(httpServer, options);

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const { InMemorySessionStore } = require("./sessionStore");
const sessionStore = new InMemorySessionStore();

const { InMemoryGameData } = require("./gameData");
const gameData = new InMemoryGameData();

const { InMemoryScores } = require("./scores");
const scores = new InMemoryScores();

let answersSubmitted = 0;
let gameRound = 0;
let votesSubmitted = 0;
let votingRound = 0;

app.use(cors());

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      return next();
    }
  }
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.sessionID = randomId();
  socket.userID = randomId();
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  // persist session
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  // emit session details
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  // join the "userID" room
  socket.join(socket.userID);

  // fetch existing users
  const users = [];
  sessionStore.findAllSessions().forEach((session) => {
    users.push({
      userID: session.userID,
      username: session.username,
      connected: session.connected,
    });
  });
  socket.emit("users", users);

  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  // notify users upon disconnection
  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user disconnected", socket.userID);
      // update the connection status of the session
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: false,
      });
    }
  });

  socket.on("start game", () => {
    const questions = [];
    const players = sessionStore.findAllSessions();
    gameRound++;
    let i = 0;
    players.forEach((session, i) => {
      for (j = 0; j < 2; i++, j++) {
        if (i === players.length) { i = 0 };
        questions.push({
          question: IMAGE_URLS[i],
          userID: session.userID,
          username: session.username,
          answer: '',
          votes: 0
        });
      }
    });
    io.sockets.emit("start game", questions, gameRound);
  });

  socket.on("answers submitted", (answers) => {
    gameData.saveAnswers(answers);
    answersSubmitted++;
    if (answersSubmitted === sessionStore.findAllSessions().length) {
      gameRound++;
      io.sockets.emit("start voting round", gameData.getAnswers(), gameRound);
    } else {
      io.sockets.emit("answers", gameData.getAnswers());
    }
  });

  socket.on("submit vote", (answer, question) => {
    gameData.addVote(answer);
    votesSubmitted++;
    if (votesSubmitted === sessionStore.findAllSessions().length) {
      gameData
        .getAnswers()
        .filter(e => e.question === question)
        .forEach(answer => {
          scores.saveScore(answer, votesSubmitted);
        });
      io.sockets.emit("display results", gameData.getAnswers(), scores.getScores());
    } else {
      io.sockets.emit("answers", gameData.getAnswers());
    }
  });

  socket.on("next voting round", () => {
    votingRound++;
    votesSubmitted = 0;
    if (votingRound === sessionStore.findAllSessions().length) {
      io.sockets.emit("endgame", scores.getScores());
    } else {
      io.sockets.emit("next voting round", votingRound, scores.getScores());
    }
  });

  socket.on("update user", (user) => {
    io.sockets.emit("user updated", user);
  });

  socket.onAny((event, ...args) => {
    console.log(event, args);
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

httpServer.listen(PORT, () =>
console.log(`server listening at http://localhost:${PORT}`)
);
