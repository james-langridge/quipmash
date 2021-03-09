import React, { useEffect, useContext, useState } from "react";
import {SocketContext} from '../context/socket';
import User from "./User";
import { useDispatch, useSelector } from 'react-redux';
import Button from 'react-bootstrap/Button';

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
      setRound(1);
      console.log('round', round);
    });
  }, []);

  useEffect(() => {
    socket.on("users", (newUsers) => {
      let usersCopy = [...users];
      newUsers.forEach((user) => {
        for (let i = 0; i < usersCopy.length; i++) {
          const existingUser = usersCopy[i];
          if (existingUser.userID === user.userID) {
            existingUser.connected = user.connected;
            return;
          }
        }
        user.self = user.userID === socket.userID;
        usersCopy = [...usersCopy, user];
      });
      usersCopy.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
      dispatch({ type: 'user/setUsers', payload: usersCopy });
    });

    return () => {
      socket.off("users");
    }
  }, [users]);

  useEffect(() => {
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

    return () => {
      socket.off("user connected");
    }
  }, [users]);

  useEffect(() => {
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
      socket.off("user disconnected");
    }
  }, [users]);

  const handleClick = () => {
    socket.emit("start game");
    console.log('clicked button');
  }

  useEffect(() => () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("users");
    socket.off("user connected");
    socket.off("user disconnected");
    socket.off("private message");
  }, []);

  return (
    <div>
      {users && users.map(user => <User key={user.userID} user={user} />)}
      {isHost &&
        <Button variant="primary" onClick={() => handleClick()}>
        I AM THE HOST - CLICK TO START GAME
        </Button>
      }
      {round === 1 &&
        <div>playing game</div>
      }
    </div>
  );
}

export default Game;
