import React from 'react';
import { io } from "socket.io-client";

// port the server runs on
const URL = "http://localhost:5000";

export const socket = io(URL, { autoConnect: false });;

export const SocketContext = React.createContext();

socket.onAny((event, ...args) => {
  console.log(event, args);
});
