import React, { useEffect, useContext } from "react";
import { Route, Switch } from "react-router-dom";
import { useDispatch } from 'react-redux';
import './App.css';
import SelectUsername from './components/SelectUsername';
import PrivateRoute from "./components/PrivateRoute";
import Game from './components/Game';
import {SocketContext} from './context/socket';

const App = (props) => {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const sessionID = sessionStorage.getItem("sessionID");

  if (sessionID) {
    console.log('found sessionID');
    socket.auth = { sessionID };
    socket.connect();
    dispatch({ type: 'user/isUsernameSelected', payload: true })
  }
  
  useEffect(() => {
    socket.on("session", ({ sessionID, userID }) => {
      // attach the session ID to the next reconnection attempts
      socket.auth = { sessionID };
      // store it in the sessionStorage
      sessionStorage.setItem("sessionID", sessionID);
      // save the ID of the user
      socket.userID = userID;
    });

    socket.on("connect_error", (err) => {
      if (err.message === "invalid username") {
        dispatch({ type: 'user/isUsernameSelected', payload: false })
      }
    });
  }, []);

  useEffect(() => () => {
    socket.off("connect_error");
  }, []);

  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={SelectUsername} />
        <PrivateRoute exact path="/game" component={Game} />
      </Switch>
    </div>
  );
}

export default App;
