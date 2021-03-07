import React, { useState, useEffect, useContext } from "react";
import {SocketContext} from '../context/socket';
import User from "./User";

const Game = () => {
  const socket = useContext(SocketContext);
  const [users, setUsers] = useState([]);

  socket.on("connect", () => {
    const newState = [...users];
    newState.forEach((user) => {
      if (user.self) {
        user.connected = true;
      }
    });
    setUsers(newState);
  });

  socket.on("disconnect", () => {
    const newState = [...users];
    newState.forEach((user) => {
      if (user.self) {
        user.connected = false;
      }
    });
    setUsers(newState);
  });

  socket.on("users", (newUsers) => {
      newUsers.forEach((user) => {
        let usersCopy = [...users];
          for (let i = 0; i < usersCopy.length; i++) {
              const existingUser = usersCopy[i];
              if (existingUser.userID === user.userID) {
                existingUser.connected = user.connected;
                setUsers(usersCopy);
                return;
              }
            }
          user.self = user.userID === socket.userID;
          const newState = [...users, user];
          setUsers(newState);
        });
    const newState = newUsers.sort((a, b) => {
      if (a.self) return -1;
      if (b.self) return 1;
      if (a.username < b.username) return -1;
      return a.username > b.username ? 1 : 0;
    });
    setUsers(newState);
  });

  socket.on("user connected", (user) => {
    let usersCopy = [...users];
      for (let i = 0; i < usersCopy.length; i++) {
        const existingUser = usersCopy[i];
        if (existingUser.userID === user.userID) {
          existingUser.connected = true;
          setUsers(usersCopy);
          return;
        }
      }
    const newState = [...users, user];
    setUsers(newState);
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
    setUsers(newState);
  });

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
      {users && users.map(user => {
        return <User key={user.userID} user={user} />
      })}
    </div>
  );
}

export default Game;
