const { questions } = require("./questions");

const gameRooms = {
  // [roomKey]: {
    // gameRound: 0,
    // votingRound: 0,
    // votesSubmitted: 0,
    // answersSubmitted: 0,
    // numPlayers: 0,
    // players: [
      //   {
      //       playerId: socket.id,
      //       username: socket.username,
      //     }
      //   ]
    // },
    // questionsAndAnswers: [
      //   {
      //     question,
      //     playerID,
      //     username,
      //     answer,
      //     votes,
      //   }
    // ],
    // scores: [
      //  {
      //    username: username,
      //    score: score
      //  }
  //   ]
  // }
};

const findRoom = (socket) => {
  let roomKey = 0;
  for (let keys1 in gameRooms) {
    if (gameRooms[keys1].players.some(e => e.playerID === socket.id)) {
        roomKey = keys1;
      }
    }

    return roomKey;
  }

const codeGenerator = () => {
  let code = "";
  let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

const saveScore = (answer, totalVotes, roomInfo) => {
  const {username, votes} = answer;
  const score = Math.floor(votes / totalVotes * 1000);
  const newScore = {
    username: username,
    score: score
  }
  const index = roomInfo.scores.findIndex((obj => obj.username === username));
  if (index != -1) {
    const currentScore = roomInfo.scores[index].score;
    roomInfo.scores[index].score = currentScore + score;
  } else {
    roomInfo.scores = [...roomInfo.scores, newScore];
  }
};

const getScores = roomInfo => {
  roomInfo.scores.sort((a, b) => (a.score < b.score) ? 1 : -1);

  return roomInfo.scores;
};

// do the truffle shuffle
[...Array(questions.length)]
  .map((...args) => Math.floor(Math.random() * (args[1] + 1)))
  .reduce( (a, rv, i) => ([a[i], a[rv]] = [a[rv], a[i]]) && a, questions);

module.exports = (io) => {
  io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("invalid username"));
    }
    socket.username = username;
    next();
  });

  io.on("connection", (socket) => {
    console.log(`A socket connection to the server has been made: ${socket.id}`);

    socket.on("joinRoom", (roomKey) => {
      socket.join(roomKey);
      const roomInfo = gameRooms[roomKey];
      console.log("roomInfo", roomInfo);
      roomInfo.players.push({
        username: socket.username,
        playerID: socket.id,
      });
      roomInfo.numPlayers = roomInfo.players.length;
      socket.emit("setState", roomInfo);
      socket.to(roomKey).emit("currentPlayers", {
        players: roomInfo.players,
        numPlayers: roomInfo.numPlayers,
      });
    });

    socket.on("disconnect", function () {
      const roomKey = findRoom(socket);
      const roomInfo = gameRooms[roomKey];

      if (roomInfo) {
        console.log("user disconnected: ", socket.id);
        const foundIndex = roomInfo.players.findIndex(x => x.playerID === socket.id);
        roomInfo.players.splice(foundIndex, 1);
        roomInfo.numPlayers = roomInfo.players.length;
        if (roomInfo.gameRound === 1 && roomInfo.answersSubmitted === roomInfo.numPlayers) {
          roomInfo.gameRound++;
          io.to(roomKey).emit("start voting round", roomInfo);
        }
        if (roomInfo.gameRound === 2 && roomInfo.votesSubmitted === roomInfo.numPlayers) {
          roomInfo
            .questionsAndAnswers
            .filter(e => e.question === question)
            .forEach(answer => {
              saveScore(answer, roomInfo.votesSubmitted, roomInfo);
            });
          io.to(roomKey).emit("display results", roomInfo);
        }
        io.to(roomKey).emit("disconnected", {
          playerID: socket.id,
          numPlayers: roomInfo.numPlayers,
        });
      }
    });

    socket.on("isKeyValid", function (input) {
      if (input === process.env.REACT_APP_HOST_CODE) {
        socket.emit("isHost")
      } else if (Object.keys(gameRooms).includes(input) && gameRooms[input].gameRound > 0) {
        socket.emit("pleaseWaitForNextGame")
      } else if (Object.keys(gameRooms).includes(input)) {
        socket.emit("keyIsValid", input)
      } else {
        socket.emit("keyNotValid")
      }
    });

    socket.on("getRoomCode", async function (oldKey) {
      let newKey = codeGenerator();
      while (Object.keys(gameRooms).includes(newKey)) {
        newKey = codeGenerator();
      }
      gameRooms[newKey] = {
        roomKey: newKey,
        players: [],
        numPlayers: 0,
        gameRound: 0,
        votingRound: 0,
        votesSubmitted: 0,
        answersSubmitted: 0,
        questionsAndAnswers: [],
        scores: [],
      };
      if (!oldKey) {
        socket.emit("roomCreated", newKey);
      }
      if (oldKey) {
        io.in(oldKey).emit("roomCreated", newKey);
        io.socketsLeave(oldKey);
      };
    });

    socket.on("start game", async (restart) => {
      const roomKey = findRoom(socket);
      const roomInfo = gameRooms[roomKey];
      const players = roomInfo.players;
      roomInfo.gameRound = 1;
      let i = 0;
      let questionID = 0;
      roomInfo.players.forEach((player, i) => {
        for (j = 0; j < 2; j++, i++) {
          if (i === players.length) {
            i = 0
          };
          roomInfo.questionsAndAnswers.push({
            questionID: questionID++,
            question: questions[i],
            playerID: player.playerID,
            username: player.username,
            answer: '',
            votes: 0
          });
        }
      });
      // remove questions that no longer spark joy
      questions.splice(0, players.length);
      io.sockets.emit("start game", roomInfo);
    });

    socket.on("answers submitted", (answers) => {
      const roomKey = findRoom(socket);
      const roomInfo = gameRooms[roomKey];
      answers.forEach(answer => {
        const foundIndex = roomInfo.questionsAndAnswers.findIndex(x => x.questionID === answer.questionID);
        roomInfo.questionsAndAnswers[foundIndex] = answer;
      });
      roomInfo.answersSubmitted++;
      if (roomInfo.answersSubmitted === roomInfo.numPlayers) {
        roomInfo.gameRound++;
        io.sockets.emit("start voting round", roomInfo);
      } else {
        io.sockets.emit("answers", roomInfo);
      }
    });

    socket.on("submit vote", (question, answer) => {
      const roomKey = findRoom(socket);
      const roomInfo = gameRooms[roomKey];
      if (answer !== null) {
        const index = roomInfo.questionsAndAnswers.findIndex((obj => obj.answer === answer));
        const currentVotes = roomInfo.questionsAndAnswers[index].votes;
        roomInfo.questionsAndAnswers[index].votes = currentVotes + 1;
      }
      roomInfo.votesSubmitted++;
      if (roomInfo.votesSubmitted === roomInfo.numPlayers) {
        roomInfo
          .questionsAndAnswers
          .filter(e => e.question === question)
          .forEach(answer => {
            saveScore(answer, roomInfo.votesSubmitted, roomInfo);
          });
        io.sockets.emit("display results", roomInfo, getScores(roomInfo));
      } else {
        io.sockets.emit("answers", roomInfo);
      }
    });

    socket.on("next voting round", () => {
      const roomKey = findRoom(socket);
      const roomInfo = gameRooms[roomKey];
      roomInfo.votingRound++;
      roomInfo.votesSubmitted = 0;
      if (roomInfo.votingRound === roomInfo.answersSubmitted) {
        io.sockets.emit("endgame", getScores(roomInfo));
      } else {
        io.sockets.emit("next voting round", roomInfo, getScores(roomInfo));
      }
    });

    socket.onAny((event, ...args) => {
      console.log(event, args);
    });
  });
}
