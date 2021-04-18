import React, { useContext, useEffect, useState } from "react";
import SocketContext from '../socketContext/context';
import Image from 'react-bootstrap/Image';
import Countdown from "./Countdown";

const Results = () => {
  const { totalVotes, roomInfo: {questionsAndAnswers, votingRound} } = useContext(SocketContext);
  const questions = [...new Set(questionsAndAnswers.map(({ question }) => question))];
  const [answers, setAnswers] = useState(questionsAndAnswers.filter(e => e.question === questions[votingRound]));
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    setAnswers(questionsAndAnswers.filter(e => e.question === questions[votingRound]));
  }, [questionsAndAnswers, votingRound]);

  return (
    <>
      {questions[votingRound].includes('amazonaws') ?
        <Image
          src={questions[votingRound]}
          rounded
          fluid
          className="my-2"
        /> :
        <h2>{questions[votingRound]}</h2>
      }
      {answers.map(answer =>
        <p key={answer.questionID}>
          "{answer.answer}" has {answer.votes} votes... {Math.floor(answer.votes / totalVotes * 1000)} points for {answer.username}!
        </p>
      )}
      <Countdown
        functions={[isTimeUp, setIsTimeUp]}
        time={10}
        text={'until next round starts'}
      />
    </>
  );
}

export default Results;
