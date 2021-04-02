import React from 'react';
import { io } from "socket.io-client";

// let URL = 'http://localhost:5000';
// if (process.env.NODE_ENV === 'production') {
//   URL = process.env.REACT_APP_CORS_ORIGIN;
// }

export const socket = io();
export const SocketContext = React.createContext();

socket.onAny((event, ...args) => {
  console.log(event, args);
});
