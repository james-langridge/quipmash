import React, { useState, useEffect } from "react";
import socket from "../socket";
import User from "./User";

const Game = () => {
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
    const newState = [...users].forEach((user) => {
      if (user.self) {
        user.connected = false;
      }
    });
    setUsers(newState);
  });

  const initReactiveProperties = (user) => {
    user.connected = true;
  };

  socket.on("users", (users) => {
    users.forEach((user) => {
      user.self = user.userID === socket.id;
      initReactiveProperties(user);
    });
    // put the current user first, and sort by username
    const newState = users.sort((a, b) => {
      if (a.self) return -1;
      if (b.self) return 1;
      if (a.username < b.username) return -1;
      return a.username > b.username ? 1 : 0;
    });
    setUsers(newState);
  });

  socket.on("user connected", (user) => {
    initReactiveProperties(user);
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
