import { combineReducers } from "redux";
import userReducer from "./userReducers";
import gameReducer from "./gameReducers";

export default combineReducers({
  user: userReducer,
  game: gameReducer
});
