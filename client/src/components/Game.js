import React, { useEffect, useContext, useState } from "react";
import {SocketContext} from '../context/socket';
import User from "./User";
import { useDispatch, useSelector } from 'react-redux';
import Button from 'react-bootstrap/Button';
import {IMAGE_URLS} from './ImageUrls';
import Prompt from "./Prompt";

const Game = (props) => {
  const isUsernameSelected = useSelector(state => state.user.isUsernameSelected);
  const isHost = useSelector(state => state.user.isHost);
  const socket = useContext(SocketContext);
  const users = useSelector(state => state.user.users);
  const dispatch = useDispatch();
  const [round, setRound] = useState(0);

  if (!isUsernameSelected) {
    dispatch({ type: 'user/isUsernameSelected', payload: false })
    props.history.push('/');
  }

  useEffect(() => {
    socket.on("connect", () => {
      dispatch({ type: 'users/isUserConnected', payload: true})
    });

    socket.on("disconnect", () => {
      dispatch({ type: 'users/isUserConnected', payload: false})
    });

    socket.on("start game", () => {
      const prevRound = round;
      setRound(prevRound+1);
    });

    socket.on("user updated", (user) => {
      user.self = user.userID === socket.userID;
      dispatch({ type: 'user/updateUser', payload: user });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("start game");
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
        newUser.game = [];
        if (i % 2 === 0) {
          for (let k = i; k < i+2; k++) {
            newUser.game.push({ 'prompt': IMAGE_URLS[k] });
          }
        } else {
          for (let k = i-1; k < i+1; k++) {
            newUser.game.push({ 'prompt': IMAGE_URLS[k] });
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
      for (let i = 0; i < newState.length; i++) {
        const user = newState[i];
        user.game = [];
        if (i % 2 === 0) {
          for (let j = i; j < i+2; j++) {
            user.game.push({ 'prompt': IMAGE_URLS[j] });
          }
        } else {
          for (let j = i-1; j < i+1; j++) {
            user.game.push({ 'prompt': IMAGE_URLS[j] });
          }
        }
      }
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

  const handleClick = () => {
    socket.emit("start game");
    console.log('clicked button');
  }

  // get number of players and ids
  // assign picture prompts to them, save in redux
  // Prompt component checks socket id and renders correct picture prompt for
  // each user
  // and saves their answers into redux
  // each Prompt component tells server when user has finished answering
  // server keeps track and broadcasts to all users when all done or time up
  // view changes to voting component

  return (
    <div>
      {users && users.map(user => <User key={user.userID} user={user} />)}
      {isHost &&
        <Button variant="primary" onClick={() => handleClick()}>
        I AM THE HOST - CLICK TO START GAME
        </Button>
      }
      {round === 1 &&
        <Prompt />
      }
    </div>
  );
}

export default Game;
