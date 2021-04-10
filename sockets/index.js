const utils = require('../utils');
let questions = [];
const gameRooms = {
  // [roomKey]: {
    // admin: '',
    // gameRound: 0,
    // votingRound: 0,
    // currentQuestion: '',
    // players: [
      //   {
      //       playerID: socket.id,
      //       username: socket.username,
      //       hasSubmittedAnswers: false,
      //       hasVoted: false,
      //       isConnected: true,
      //     }
      //   ]
    // },
    // questionsAndAnswers: [
      //   {
      //     questionID,
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
      if (Object.keys(gameRooms).includes(input) && gameRooms[input].gameRound > 0) {
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
        admin: socket.id,
        roomKey: newKey,
        players: [],
        gameRound: 0,
        votingRound: 0,
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
        hasSubmittedAnswers: false,
        hasVoted: false,
        isConnected: true,
      });
      emit.playerJoinedRoom(roomKey, roomInfo);
    });

    socket.on("startGame", async (roomKey, q) => {
      questions = q;
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
      if (roomInfo) {
        answers.forEach(answer => {
          const questionIndex = roomInfo.questionsAndAnswers.findIndex(x => x.questionID === answer.questionID);
          roomInfo.questionsAndAnswers[questionIndex] = answer;
        });
        const playerIndex = roomInfo.players.findIndex(x => x.playerID === socket.id);
        roomInfo.players[playerIndex].hasSubmittedAnswers = true;
        const connectedPlayersLeftToAnswer = roomInfo.players.reduce((count, player) => {
          return player.isConnected === true && player.hasSubmittedAnswers === false ? ++count : count;
        }, 0);
        if (connectedPlayersLeftToAnswer === 0) {
          roomInfo.gameRound++;
          emit.startVotingRound(roomKey, roomInfo);
        } else {
          emit.answersSubmitted(roomKey, roomInfo);
        }
      } else {
        console.error('roomInfo is undefined');
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
        const playerIndex = roomInfo.players.findIndex(x => x.playerID === socket.id);
        roomInfo.players[playerIndex].hasVoted = true;
        const connectedPlayersLeftToVote = roomInfo.players.reduce((acc, cur) => {
          return cur.isConnected === true && cur.hasVoted === false ? ++acc : acc
        }, 0);
        if (connectedPlayersLeftToVote === 0) {
          roomInfo
            .questionsAndAnswers
            .filter(e => e.question === question)
            .forEach(answer => {
              utils.saveScore(answer, roomInfo);
            });
            emit.displayResults(roomKey, utils.getTotalVotes(roomInfo), roomInfo);
          roomInfo.players.forEach(player => player.hasVoted = false);
        } else {
          emit.voteSubmitted(roomInfo);
        }
      } else {
        console.error('roomInfo is undefined');
      }
    });

    socket.on("nextVotingRound", (roomKey) => {
      const roomInfo = gameRooms[roomKey];
      if (roomInfo) {
        roomInfo.votingRound++;
        const playersWithAnswers = roomInfo.players.reduce((count, player) => {
          return player.hasSubmittedAnswers === true ? ++count : count
        }, 0);
        if (roomInfo.votingRound === playersWithAnswers) {
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
        const playerIndex = roomInfo.players.findIndex(x => x.playerID === socket.id);
        roomInfo.players[playerIndex].isConnected = false;
        emit.playerDisconnected(roomKey, roomInfo);
      }
    });

    socket.onAny((event, ...args) => {
      console.log(event, args);
    });
  });
}
