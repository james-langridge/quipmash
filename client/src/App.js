import React, { useState, useEffect } from "react";
import './App.css';
import SelectUsername from './components/SelectUsername';
import Game from './components/Game';
import socket from './socket';

const App = () => {
  const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false);

  const onUsernameSelection = username => {
    setUsernameAlreadySelected(true);
    socket.auth = { username };
    socket.connect();
  }

  socket.on("connect_error", (err) => {
    if (err.message === "invalid username") {
      setUsernameAlreadySelected(false);
    }
  });

  useEffect(() => () => {
    socket.off("connect_error");
  }, []);

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
