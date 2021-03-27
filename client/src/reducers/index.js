import { combineReducers } from "redux";
import playerReducer from "./playerReducers";
import gameReducer from "./gameReducers";

export default combineReducers({
  player: playerReducer,
  game: gameReducer
});
