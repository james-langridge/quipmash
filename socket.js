const { questions } = require("./questions");

const gameRooms = {
  // [roomKey]: {
    // gameRound: 0,
    // votingRound: 0,
    // votesSubmitted: 0,
    // answersSubmitted: 0,
    // currentQuestion: ''
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

const saveScore = (answer, roomInfo) => {
  const {username, votes} = answer;
  const score = Math.floor(votes / roomInfo.votesSubmitted * 1000);
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

const sortScores = roomInfo => {
  roomInfo.scores.sort((a, b) => (a.score < b.score) ? 1 : -1);
};

const getTotalVotes = roomInfo => {
  const questions = roomInfo.questionsAndAnswers.map(({ question }) => question);
  const questionsDeDup = [...new Set(questions)];
  let totalVotes = roomInfo.questionsAndAnswers
    .filter(e => e.question === questionsDeDup[roomInfo.votingRound])
    .reduce((prev, current) => (prev.votes + current.votes));
  if (typeof totalVotes === 'object') {
    totalVotes = totalVotes.votes;
  }

  return totalVotes;
}

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

    socket.on("isKeyValid", function (input) {
      if (input === process.env.REACT_APP_HOST_CODE) {
        socket.emit("isHost")
      } else if (Object.keys(gameRooms).includes(input) && gameRooms[input].gameRound > 0) {
        socket.emit("pleaseWaitForNextGame", "Game already started. Please wait for the next game")
      } else if (Object.keys(gameRooms).includes(input)) {
        socket.emit("keyIsValid", input)
      } else {
        socket.emit("keyNotValid", "Game code does not exist. Please try again.")
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
        currentQuestion: '',
        scores: [],
      };
      // sending to the client (game host)
      socket.emit("roomKey", newKey);
      if (oldKey) {
        // sending to all clients in "oldKey" room except sender
        socket.to(oldKey).emit("roomCreated", newKey);
        // make all Socket instances leave the "oldKey" room
        io.socketsLeave(oldKey);
        delete gameRooms.oldKey;
      };
    });

    socket.on("joinRoom", (roomKey) => {
      socket.join(roomKey);
      const roomInfo = gameRooms[roomKey];
      roomInfo.players.push({
        username: socket.username,
        playerID: socket.id,
      });
      roomInfo.numPlayers = roomInfo.players.length;
    });

    socket.on("startGame", async (roomKey) => {
      const roomInfo = gameRooms[roomKey];
      if (roomInfo) {
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
        // sending to all clients in "roomKey" room, including sender
        io.in(roomKey).emit("startGame", roomInfo);
      } else {
        console.log('roominfo is undefined');
      }
    });

    socket.on("submitAnswers", (answers) => {
      const roomKey = findRoom(socket);
      const roomInfo = gameRooms[roomKey];
      answers.forEach(answer => {
        const foundIndex = roomInfo.questionsAndAnswers.findIndex(x => x.questionID === answer.questionID);
        roomInfo.questionsAndAnswers[foundIndex] = answer;
      });
      roomInfo.answersSubmitted++;
      if (roomInfo.answersSubmitted === roomInfo.numPlayers) {
        roomInfo.gameRound++;
        // sending to all clients in "roomKey" room, including sender
        io.in(roomKey).emit("startVotingRound", roomInfo);
      } else {
        // sending to all clients in "roomKey" room, including sender
        io.in(roomKey).emit("answers", roomInfo);
      }
    });

    socket.on("submitVote", (question, answer) => {
      const roomKey = findRoom(socket);
      const roomInfo = gameRooms[roomKey];
      if (roomInfo) {
        roomInfo.currentQuestion = question;
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
              saveScore(answer, roomInfo);
            });
            // sending to all clients in "roomKey" room, including sender
          io.in(roomKey).emit("displayResults", getTotalVotes(roomInfo), roomInfo);
        } else {
          socket.emit("voteSubmitted");
        }
      } else {
        console.log('roomInfo is undefined');
      }
    });

    socket.on("nextVotingRound", (roomKey) => {
      const roomInfo = gameRooms[roomKey];
      if (roomInfo) {
        roomInfo.votingRound++;
        roomInfo.votesSubmitted = 0;
        if (roomInfo.votingRound === roomInfo.answersSubmitted) {
          sortScores(roomInfo);
          // sending to all clients in "roomKey" room, including sender
          io.in(roomKey).emit("endgame", roomInfo);
        } else {
          // sending to all clients in "roomKey" room, including sender
          io.in(roomKey).emit("nextVotingRound", roomInfo);
        }
      }
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
          // sending to all clients in "roomKey" room, including sender
          io.in(roomKey).emit("startVotingRound", roomInfo);
        } else if (roomInfo.gameRound === 2 && roomInfo.votesSubmitted === roomInfo.numPlayers) {
          roomInfo
            .questionsAndAnswers
            .filter(e => e.question === roomInfo.currentQuestion)
            .forEach(answer => {
              saveScore(answer, roomInfo);
            });
            // sending to all clients in "roomKey" room, including sender
          io.in(roomKey).emit("displayResults", getTotalVotes(roomInfo));
        }
        // sending to all clients in "roomKey" room, including sender
        io.in(roomKey).emit("disconnected", {
          playerID: socket.id,
          numPlayers: roomInfo.numPlayers,
        });
      }
    });

    socket.onAny((event, ...args) => {
      console.log(event, args);
    });
  });
}
