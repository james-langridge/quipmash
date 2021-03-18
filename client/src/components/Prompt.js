import React, { useEffect, useContext, useState } from "react";
import { useSelector } from 'react-redux';
import {SocketContext} from '../context/socket';

const Prompt = () => {
  const socket = useContext(SocketContext);
  const promptsAndAnswers = useSelector(state => state.game.promptsAndAnswers);
  const [caption, setCaption] = useState('');
  const [round, setRound] = useState(0);
  const [userQuestions, setUserQuestions] = useState(promptsAndAnswers.filter(e => e.userID === socket.userID));

  const onChange = e => {
    setCaption(e.target.value);
  };

  const isValid = () => caption.length > 2 ? true : false;

  const onSubmit = (e) => {
    e.preventDefault();
    const prevRound = round;
    const newState = [...userQuestions];
    newState[round] = { ...newState[round], answer: caption };
    setUserQuestions(newState);
    setRound(prevRound+1);
  }

  useEffect(() => {
    if (round === 2) {
      socket.emit("answers submitted", userQuestions);
    }
  }, [userQuestions, round]);

  return (
    <div>
      {round < 2 ? (
        <div>
        <img src={userQuestions[round].question} />
          <form onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Hilarious caption here..."
              value={caption}
              onChange={onChange}
              className="text-input-field"
              autoFocus={true}
            />
            <button
              disabled={!isValid()}
            >
              Submit
            </button>
          </form>
        </div>
      ) : (
        <div>Waiting for other players...</div>
      )}
    </div>
  );
}

export default Prompt;
