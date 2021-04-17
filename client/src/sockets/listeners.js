import { socket } from './index';
import { joinRoom } from './emit';

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

  socket.on("playerDisconnected", roomInfo => {
    setState(state => {
      return {
        ...state,
        roomInfo
      }
    });
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

  socket.on("playerJoinedRoom", roomInfo => {
    setState(state => {
      return {
        ...state,
        roomInfo
      }
    });
  });

  socket.on("startGameCountDown", () => {
    setState(state => {
      return {
        ...state,
        countDownToGame: true
      }
    });
  });

  socket.on("startGame", roomInfo => {
    setState(state => {
      return {
        ...state,
        totalVotes: 0,
        gameStatus: 'voting',
        countDownToGame: false,
        roomInfo
      }
    });
  });

  socket.on("answersSubmitted", roomInfo => {
    setState(state => {
      return {
        ...state,
        roomInfo
      }
    });
  });

  socket.on("startVotingRound", roomInfo => {
    setState(state => {
      return {
        ...state,
        roomInfo
      }
    });
  });

  socket.on("voteSubmitted", roomInfo => {
    setState(state => {
      return {
        ...state,
        roomInfo,
        gameStatus: 'waiting'
      }
    });
  });

  socket.on("displayResults", (totalVotes, roomInfo) => {
    setState(state => {
      return {
        ...state,
        roomInfo,
        totalVotes: totalVotes,
        gameStatus: 'results'
      }
    });
  });

  socket.on("nextVotingRound", roomInfo => {
    setState(state => {
      return {
        ...state,
        roomInfo,
        gameStatus: 'voting'
      }
    });
  });

  socket.on("endgame", roomInfo => {
    setState(state => {
      return {
        ...state,
        roomInfo,
        gameStatus: 'endgame'
      }
    });
  });

  socket.onAny((event, ...args) => {
    console.log(event, args);
  });
};
