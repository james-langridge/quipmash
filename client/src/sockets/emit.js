import { socket } from "./index";

export const isKeyValid = (roomKey) => {
  socket.emit("isKeyValid", roomKey);
}

export const createGame = (roomKey) => {
  socket.emit("getRoomCode", roomKey);
}

export const joinRoom = (roomKey) => {
  socket.emit("joinRoom", roomKey);
}

export const startGameCountDown = (roomKey, questions) => {
  socket.emit("startGameCountDown", roomKey, questions);
}

export const startGame = (roomKey) => {
  socket.emit("startGame", roomKey);
}

export const submitAnswers = (roomKey, userQuestions) => {
  socket.emit("submitAnswers", roomKey, userQuestions);
}

export const submitVote = (roomKey, question, answer) => {
  socket.emit("submitVote", roomKey, question, answer);
}
