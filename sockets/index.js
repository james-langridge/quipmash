const utils = require('../utils');
const gameRooms = {
  // [roomKey]: {
    // isGameInProgress: false,
    // hasKeyBeenGenerated: false,
    // admin: '',
    // roomKey: '',
    // gameRound: 0,
    // votingRound: 0,
    // players: [
      //   {
      //       playerID: socket.id,
      //       username: socket.username,
      //       hasSubmittedAnswers: false,
      //       hasVoted: false,
      //       isConnected: true,
      //       score: 0,
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
    // ]
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
      const roomInfo = gameRooms[newKey] = {
        hasKeyBeenGenerated: true,
        admin: socket.id,
        roomKey: newKey,
        players: [],
        gameRound: 0,
        votingRound: 0,
        questionsAndAnswers: [],
      };
      emit.roomKey(newKey, roomInfo);
      if (oldKey) {
        emit.roomCreated(oldKey, newKey, roomInfo);
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
        score: 0,
      });
      emit.playerJoinedRoom(roomKey, roomInfo);
    });

    socket.on("startGameCountDown", async (roomKey, questions) => {
      const roomInfo = gameRooms[roomKey];
      if (roomInfo) {
        roomInfo.isGameInProgress = true;
        const players = roomInfo.players;
        let i = 0;
        let questionID = 0;
        utils.shuffle(questions);
        players.forEach((player, i) => {
          for (j = 0; j < 2; j++, i++) {
            if (i === players.length) {
              i = 0;
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
        emit.startGameCountDown(roomKey, roomInfo);
        setTimeout(() => {
          roomInfo.gameRound = 1;
          emit.startGame(roomKey, roomInfo);
        }, 10000);
      } else {
        console.log('roominfo is undefined');
      }
    });

    socket.on("submitAnswers", (roomKey, answers) => {
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

    const nextVotingRound = roomKey => {
      const roomInfo = gameRooms[roomKey];
      if (roomInfo) {
        roomInfo.votingRound++;
        const playersWithAnswers = roomInfo.players.reduce((count, player) => {
          return player.hasSubmittedAnswers === true ? ++count : count
        }, 0);
        if (roomInfo.votingRound === playersWithAnswers) {
          roomInfo.hasKeyBeenGenerated = false;
          roomInfo.isGameInProgress = false;
          emit.endGame(roomKey, roomInfo);
        } else {
          emit.nextVotingRound(roomKey, roomInfo);
        }
      }
    };

    socket.on("submitVote", (roomKey, question, answer) => {
      const roomInfo = gameRooms[roomKey];
      if (roomInfo) {
        const questionsAndAnswers = roomInfo.questionsAndAnswers;
        const players = roomInfo.players;
        const playerIndex = players.findIndex(x => x.playerID === socket.id);

        if (answer !== null) {
          const answerIndex = questionsAndAnswers.findIndex((obj => obj.answer === answer));
          const currentVotes = questionsAndAnswers[answerIndex].votes;
          questionsAndAnswers[answerIndex].votes = currentVotes + 1;
        }

        players[playerIndex].hasVoted = true;

        const connectedPlayersLeftToVote = players.reduce((count, player) => {
          return player.isConnected === true && player.hasVoted === false ? ++count : count
        }, 0);

        if (connectedPlayersLeftToVote === 0) {
          questionsAndAnswers
            .filter(e => e.question === question)
            .forEach(answer => {
              utils.saveScore(answer, roomInfo);
            });
            emit.displayResults(roomKey, utils.getTotalVotes(roomInfo), roomInfo);
          players.forEach(player => player.hasVoted = false);
          setTimeout(() => {
            nextVotingRound(roomKey);
          }, 10000);
        } else {
          emit.voteSubmitted(roomInfo);
        }
      } else {
        console.error('roomInfo is undefined');
      }
    });

    socket.on("disconnect", function () {
      const roomKey = utils.findRoom(socket, gameRooms);
      const roomInfo = gameRooms[roomKey];
      if (roomInfo) {
        const playerIndex = roomInfo.players.findIndex(x => x.playerID === socket.id);
        // if game hasn't started just delete the player
        if (roomInfo.gameRound === 0) {
          roomInfo.players.splice(playerIndex, 1);
        } else {
          // if game has started then keep player as disconnected
          roomInfo.players[playerIndex].isConnected = false;
        }
        emit.playerDisconnected(roomKey, roomInfo);
      }
    });

    socket.onAny((event, ...args) => {
      console.log(event, args);
    });
  });
}
