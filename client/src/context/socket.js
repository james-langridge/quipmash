import React from 'react';
import { io } from "socket.io-client";

// dev
// const URL = 'http://localhost:5000';
// prod
const URL = 'https://eira-is-one-year-old.herokuapp.com';

export const socket = io(URL);
export const SocketContext = React.createContext();

socket.onAny((event, ...args) => {
  console.log(event, args);
});
