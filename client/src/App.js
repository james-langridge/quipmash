import React, { useEffect, useContext } from "react";
import { Route, Switch } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import {SocketContext} from './context/socket';
import Header from './components/Header';
import SelectUsername from './components/SelectUsername';
import Game from './components/Game';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = (props) => {
  const socket = useContext(SocketContext);
  // const players = useSelector(state => state.player.players);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on("connect_error", (err) => {
      if (err.message === "invalid username") {
        dispatch({ type: 'player/isUsernameSelected', payload: false })
      }
    });
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`A socket connection to the server has been made: ${socket.id}`);
      // dispatch({ type: 'players/isPlayerConnected', payload: true})
    });

    socket.on("disconnect", () => {
      // dispatch({ type: 'players/isPlayerConnected', payload: false})
    });

    // socket.on("player updated", (player) => {
    //   player.self = player.userID === socket.userID;
    //   dispatch({ type: 'player/updatePlayer', payload: player });
    // });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      // socket.off("player updated");
    }
  }, []);

  useEffect(() => () => {
    socket.off("connect_error");
  }, []);

  // useEffect(() => {
    // socket.on("players", (gameData) => {
    //   const newPlayers = gameData.players;
    //   let playersCopy = [...players];
    //   for (let i = 0; i < newPlayers.length; i++) {
    //     const newPlayer = newPlayers[i];
    //     for (let j = 0; j < playersCopy.length; j++) {
    //       const existingPlayer = playersCopy[j];
    //       if (existingPlayer.userID === newPlayer.userID) {
    //         existingPlayer.connected = newPlayer.connected;
    //         return;
    //       }
    //     }
    //     newPlayer.self = newPlayer.userID === socket.userID;
    //     playersCopy = [...playersCopy, newPlayer];
    //   };
    //   playersCopy.sort((a, b) => {
    //     if (a.self) return -1;
    //     if (b.self) return 1;
    //     if (a.username < b.username) return -1;
    //     return a.username > b.username ? 1 : 0;
    //   });
    //   dispatch({ type: 'player/setPlayers', payload: playersCopy });
    // });

    // socket.on("player connected", (player) => {
    //   console.log(`${player.username} connected.`)
    //   let playersCopy = [...players];
    //     for (let i = 0; i < playersCopy.length; i++) {
    //       const existingPlayer = playersCopy[i];
    //       if (existingPlayer.userID === player.userID) {
    //         existingPlayer.connected = true;
    //         dispatch({ type: 'player/setPlayers', payload: playersCopy });
    //         return;
    //       }
    //     }
    //   const newState = [...players, player];
    //   dispatch({ type: 'player/setPlayers', payload: newState });
    // });

    // socket.on("player disconnected", (id) => {
    //   const newState = [...players];
    //   for (let i = 0; i < newState.length; i++) {
    //     const player = newState[i];
    //     if (player.userID === id) {
    //       player.connected = false;
    //       break;
    //     }
    //   }
    //   dispatch({ type: 'player/setPlayers', payload: newState });
    // });

  //   return () => {
  //     socket.off("players");
  //     socket.off("player connected");
  //     socket.off("player disconnected");
  //   }
  // }, [players]);

  return (
    <div className="App">
      <Header />
      <Switch>
        <Route exact path="/" component={SelectUsername} />
        <Route exact path="/game" component={Game} />
      </Switch>
      <Footer />
    </div>
  );
}

export default App;
