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

export const startGame = (roomKey) => {
  socket.emit("startGame", roomKey);
}

export const submitAnswers = (userQuestions) => {
  socket.emit("submitAnswers", userQuestions);
}

export const submitVote = (question, answer) => {
  socket.emit("submitVote", question, answer);
}

export const nextVotingRound = (roomKey) => {
  socket.emit("nextVotingRound", roomKey);
}
