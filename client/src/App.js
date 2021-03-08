import React, { useState, useEffect, useContext } from "react";
import './App.css';
import SelectUsername from './components/SelectUsername';
import Game from './components/Game';
import {SocketContext} from './context/socket';

const App = () => {
  const socket = useContext(SocketContext);
  const sessionID = localStorage.getItem("sessionID");
  const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(sessionID ? true : false);

  if (sessionID) {
    socket.auth = { sessionID };
    socket.connect();
  }

  socket.on("session", ({ sessionID, userID }) => {
    // attach the session ID to the next reconnection attempts
    socket.auth = { sessionID };
    // store it in the localStorage
    localStorage.setItem("sessionID", sessionID);
    // save the ID of the user
    socket.userID = userID;
  });

  const onUsernameSelection = username => {
    socket.auth = { username };
    socket.connect();
    setUsernameAlreadySelected(true);
  }

  socket.on("connect_error", (err) => {
    if (err.message === "invalid username") {
      setUsernameAlreadySelected(false);
    }
  });

  useEffect(() => () => {
    socket.off("connect_error");
  }, []);

  useEffect(() => {
    console.log('usernameAlreadySelected', usernameAlreadySelected);
  }, [usernameAlreadySelected]);

  return (
    <div className="App">
      {usernameAlreadySelected
        ? <Game />
        : <SelectUsername onUsernameSelection={onUsernameSelection} />
      }
    </div>
  );
}

export default App;
