import React, { useState, useEffect } from "react";
import SocketContext from "./context";
import { initSockets } from "../sockets";

const SocketProvider = (props) => {
  const [state, setState] = useState({
    isUsernameSelected: false,
    isHost: false,
    roomKey: null,
    gameRound: 0,
    votingRound: 0,
    questionsAndAnswers: [],
    gameStatus: 'voting',
    totalVotes: 0,
    scores: [],
    error: '',
  });

  useEffect(() => {
    initSockets({ setState });
  }, [initSockets]);

  return (
    <SocketContext.Provider value={ state }>
      { props.children }
    </SocketContext.Provider>
  )
};

export default SocketProvider;
