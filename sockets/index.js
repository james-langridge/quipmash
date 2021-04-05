const { questions } = require("../questions");
const utils = require('../utils');

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
    const emit = require('./emit')(io, socket);
    console.log(`A socket connection to the server has been made: ${socket.id}`);

    socket.on("isKeyValid", function (input) {
      // TODO: update heroku config env var
      if (input === process.env.HOST_CODE) {
        emit.isHost();
      } else if (Object.keys(gameRooms).includes(input) && gameRooms[input].gameRound > 0) {
        emit.waitForNextGame();
      } else if (Object.keys(gameRooms).includes(input)) {
        emit.keyIsValid(input);
      } else {
        emit.keyNotValid();
      }
    });

    socket.on("getRoomCode", async function (oldKey) {
      let newKey = utils.codeGenerator();
      while (Object.keys(gameRooms).includes(newKey)) {
        newKey = utils.codeGenerator();
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
      emit.roomKey(newKey);
      if (oldKey) {
        emit.roomCreated(oldKey, newKey);
        emit.leaveOldRoom(oldKey);
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
        utils.shuffle(questions);
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
        questions.splice(0, players.length);
        emit.startGame(roomKey, roomInfo);
      } else {
        console.log('roominfo is undefined');
      }
    });

    socket.on("submitAnswers", (answers) => {
      const roomKey = utils.findRoom(socket, gameRooms);
      const roomInfo = gameRooms[roomKey];
      answers.forEach(answer => {
        const foundIndex = roomInfo.questionsAndAnswers.findIndex(x => x.questionID === answer.questionID);
        roomInfo.questionsAndAnswers[foundIndex] = answer;
      });
      roomInfo.answersSubmitted++;
      if (roomInfo.answersSubmitted === roomInfo.numPlayers) {
        roomInfo.gameRound++;
        emit.startVotingRound(roomKey, roomInfo);
      }
    });

    socket.on("submitVote", (question, answer) => {
      const roomKey = utils.findRoom(socket, gameRooms);
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
              utils.saveScore(answer, roomInfo);
            });
            emit.displayResults(roomKey, utils.getTotalVotes(roomInfo), roomInfo);
        } else {
          emit.voteSubmitted();
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
          utils.sortScores(roomInfo);
          emit.endGame(roomKey, roomInfo);
        } else {
          emit.nextVotingRound(roomKey, roomInfo);
        }
      }
    });

    socket.on("disconnect", function () {
      const roomKey = utils.findRoom(socket, gameRooms);
      const roomInfo = gameRooms[roomKey];

      if (roomInfo) {
        console.log("user disconnected: ", socket.id);
        const foundIndex = roomInfo.players.findIndex(x => x.playerID === socket.id);
        roomInfo.players.splice(foundIndex, 1);
        roomInfo.numPlayers = roomInfo.players.length;
        if (roomInfo.gameRound === 1 && roomInfo.answersSubmitted === roomInfo.numPlayers) {
          roomInfo.gameRound++;
          emit.startVotingRound(roomKey, roomInfo);
        } else if (roomInfo.gameRound === 2 && roomInfo.votesSubmitted === roomInfo.numPlayers) {
          roomInfo
            .questionsAndAnswers
            .filter(e => e.question === roomInfo.currentQuestion)
            .forEach(answer => {
              utils.saveScore(answer, roomInfo);
            });
            emit.displayResults(roomKey, utils.getTotalVotes(roomInfo), roomInfo);
        }
      }
    });

    socket.onAny((event, ...args) => {
      console.log(event, args);
    });
  });
}
