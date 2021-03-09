import React from 'react';
import { io } from "socket.io-client";

// dev
// const URL = 'http://localhost:5000';
// prod
const URL = 'https://floating-reaches-30894.herokuapp.com';

export const socket = io(URL, { autoConnect: false });
export const SocketContext = React.createContext();

socket.onAny((event, ...args) => {
  console.log(event, args);
});
