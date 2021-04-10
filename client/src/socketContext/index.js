import React, { useState, useEffect } from "react";
import SocketContext from "./context";
import { initSockets } from "../sockets";

const SocketProvider = (props) => {
  const [state, setState] = useState({
    isUsernameSelected: false,
    roomKey: null,
    error: '',
    totalVotes: 0,
    gameStatus: 'voting',
    roomInfo: {
      gameRound: 0,
      votingRound: 0,
      players: [],
      questionsAndAnswers: [],
      scores: []
    }
  });

  useEffect(() => {
    initSockets({ setState });
  }, []);

  return (
    <SocketContext.Provider value={ state }>
      { props.children }
    </SocketContext.Provider>
  )
};

export default SocketProvider;
