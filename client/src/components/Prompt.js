import React, { useEffect, useContext, useState } from "react";
import { useSelector } from 'react-redux';
import {SocketContext} from '../context/socket';

const Prompt = () => {
  const socket = useContext(SocketContext);
  const promptsAndAnswers = useSelector(state => state.game.promptsAndAnswers);
  const [caption, setCaption] = useState('');
  const [questionRound, setQuestionRound] = useState(0);
  const [userQuestions, setUserQuestions] = useState(promptsAndAnswers.filter(e => e.userID === socket.userID));

  const onChange = e => {
    setCaption(e.target.value);
  };

  const isValid = () => caption.length > 2 ? true : false;

  const onSubmit = (e) => {
    e.preventDefault();
    const newState = [...userQuestions];
    newState[questionRound] = { ...newState[questionRound], answer: caption };
    setUserQuestions(newState);
    setQuestionRound(questionRound+1);
  }

  useEffect(() => {
    if (questionRound === 2) {
      socket.emit("answers submitted", userQuestions);
    }
  }, [userQuestions, questionRound]);

  return (
    <div>
      {questionRound < 2 ? (
        <div>
        <img src={userQuestions[questionRound].question} />
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
