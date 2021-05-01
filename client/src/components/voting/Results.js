import React, { useContext, useEffect, useState } from "react";
import SocketContext from '../../socketContext/context';
import Countdown from "../common/Countdown";

const Results = () => {
  const { totalVotes, roomInfo: {questionsAndAnswers, votingRound} } = useContext(SocketContext);
  const questions = [...new Set(questionsAndAnswers.map(({ question }) => question))];
  const [answers, setAnswers] = useState(questionsAndAnswers.filter(e => e.question === questions[votingRound]));
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    setAnswers(questionsAndAnswers.filter(e => e.question === questions[votingRound]));
  }, [questionsAndAnswers, votingRound]);

  useEffect(() => {
    console.log('totalVotes:',totalVotes);
    console.log('answers', answers);
  }, [totalVotes, answers]);

  return (
    <>
      <h2>{questions[votingRound]}</h2>
      {answers.map(answer =>
        <p key={answer.questionID}>
          "{answer.answer}" has {answer.votes} vote{answer.votes !== 1 && 's'}... {Math.floor(answer.votes / totalVotes * 1000) || 0} points for {answer.username}!
        </p>
      )}
      <Countdown
        functions={[isTimeUp, setIsTimeUp]}
        time={5}
        text={'until next round starts'}
      />
    </>
  );
}

export default Results;
