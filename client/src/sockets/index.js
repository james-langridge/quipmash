import io from "socket.io-client";
import { socketListeners } from "./listeners";

export const socket = io();

export const initSockets = ({ setState }) => {
  socketListeners({ setState });
};
