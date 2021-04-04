import { socket } from './index';
import { joinRoom } from './events.js';

export const socketListeners = ({ setState }) => {
  socket.on("connect", () => {
    console.log(`A socket connection to the server has been made: ${socket.id}`);
  });

  socket.on("connect_error", err => {
    if (err.message === "invalid username") {
      setState(state => {
        return {
          ...state,
          isUsernameSelected: false
        }
      });
    }
  });

  socket.on("disconnect", () => {
    // no-op
  });

  socket.on("keyNotValid", err => {
    setState(state => {
      return {
        ...state,
        error: err
      }
    });
  });

  socket.on("keyIsValid", roomKey => {
    setState(state => {
      return {
        ...state,
        isUsernameSelected: true
      }
    });
    joinRoom(roomKey);
  });

  socket.on("isHost", () => {
    setState(state => {
      return {
        ...state,
        isHost: true,
        isUsernameSelected: true
      }
    });
  });

  socket.on("pleaseWaitForNextGame", err => {
    setState(state => {
      return {
        ...state,
        error: err
      }
    });
  });

  socket.on("roomKey", key => {
    setState(state => {
      return {
        ...state,
        roomKey: key
      }
    });
  });

  socket.on("roomCreated", key => {
    setState(state => {
      return {
        ...state,
        roomKey: key
      }
    });
    joinRoom(key);
  });

  socket.on("startGame", ({ questionsAndAnswers, gameRound }) => {
    setState(state => {
      return {
        ...state,
        questionsAndAnswers,
        gameRound
      }
    });
  });

  socket.on("startVotingRound", ({ questionsAndAnswers, gameRound }) => {
    setState(state => {
      return {
        ...state,
        questionsAndAnswers,
        gameRound
      }
    });
  });

  socket.on("voteSubmitted", () => {
    setState(state => {
      return {
        ...state,
        gameStatus: 'waiting'
      }
    });
  });

  socket.on("displayResults", (totalVotes, { questionsAndAnswers }) => {
    setState(state => {
      return {
        ...state,
        questionsAndAnswers,
        totalVotes: totalVotes,
        gameStatus: 'results'
      }
    });
  });

  socket.on("nextVotingRound", ({ votingRound }) => {
    setState(state => {
      return {
        ...state,
        votingRound,
        gameStatus: 'voting'
      }
    });
  });

  socket.on("endgame", ({ scores }) => {
    setState(state => {
      return {
        ...state,
        scores,
        gameStatus: 'endgame'
      }
    });
  });

  socket.onAny((event, ...args) => {
    console.log(event, args);
  });
};
