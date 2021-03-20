import React, { useEffect, useContext, useState } from "react";
import {SocketContext} from '../context/socket';
import User from "./User";
import { useDispatch, useSelector } from 'react-redux';
import Button from 'react-bootstrap/Button';
import Prompt from "./Prompt";
import Voting from "./Voting";

const Game = (props) => {
  const isUsernameSelected = useSelector(state => state.user.isUsernameSelected);
  const isHost = useSelector(state => state.user.isHost);
  const socket = useContext(SocketContext);
  const users = useSelector(state => state.user.users);
  const dispatch = useDispatch();
  const [gameRound, setGameRound] = useState(0);

  if (!isUsernameSelected) {
    dispatch({ type: 'user/isUsernameSelected', payload: false })
    props.history.push('/');
  }

  const startGame = () => {
    socket.emit("start game");
  }

  const nextVotingRound = () => {
    socket.emit("next voting round");
  }

  useEffect(() => {
    socket.on("connect", () => {
      dispatch({ type: 'users/isUserConnected', payload: true})
    });

    socket.on("disconnect", () => {
      dispatch({ type: 'users/isUserConnected', payload: false})
    });

    socket.on("start game", (questions, gameRound) => {
      dispatch({ type: 'game/setPrompts', payload: questions });
      setGameRound(gameRound);
    });

    socket.on("start voting round", (answers, gameRound) => {
      setGameRound(gameRound);
      dispatch({ type: 'game/setPrompts', payload: answers });
    });

    socket.on("user updated", (user) => {
      user.self = user.userID === socket.userID;
      dispatch({ type: 'user/updateUser', payload: user });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("start game");
      socket.off("start voting round");
      socket.off("user updated");
    }
  }, []);

  useEffect(() => {
    socket.on("users", (newUsers) => {
      let usersCopy = [...users];
      for (let i = 0; i < newUsers.length; i++) {
        const newUser = newUsers[i];
        for (let j = 0; j < usersCopy.length; j++) {
          const existingUser = usersCopy[j];
          if (existingUser.userID === newUser.userID) {
            existingUser.connected = newUser.connected;
            return;
          }
        }
        newUser.self = newUser.userID === socket.userID;
        usersCopy = [...usersCopy, newUser];
      };
      usersCopy.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
      dispatch({ type: 'user/setUsers', payload: usersCopy });
    });

    socket.on("user connected", (user) => {
      let usersCopy = [...users];
        for (let i = 0; i < usersCopy.length; i++) {
          const existingUser = usersCopy[i];
          if (existingUser.userID === user.userID) {
            existingUser.connected = true;
            dispatch({ type: 'user/setUsers', payload: usersCopy });
            return;
          }
        }
      const newState = [...users, user];
      dispatch({ type: 'user/setUsers', payload: newState });
    });

    socket.on("user disconnected", (id) => {
      const newState = [...users];
      for (let i = 0; i < newState.length; i++) {
        const user = newState[i];
        if (user.userID === id) {
          user.connected = false;
          break;
        }
      }
      dispatch({ type: 'user/setUsers', payload: newState });
    });

    return () => {
      socket.off("users");
      socket.off("user connected");
      socket.off("user disconnected");
    }
  }, [users]);

  return (
    <div>
      {users && users.map(user => <User key={user.userID} user={user} />)}
      {isHost &&
        <>
          <Button variant="primary" onClick={() => startGame()}>
            I AM THE HOST - CLICK TO START GAME
          </Button>
          <Button variant="primary" onClick={() => nextVotingRound()}>
            I AM THE HOST - CLICK TO START NEXT ROUND
          </Button>
        </>
      }
      {gameRound === 0 &&
        <div>Welcome to Eira's birthday game!</div>
      }
      {gameRound === 1 &&
        <Prompt />
      }
      {gameRound === 2 &&
        <Voting />
      }
    </div>
  );
}

export default Game;
