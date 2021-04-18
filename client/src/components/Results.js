import React, { useContext, useEffect, useState } from "react";
import SocketContext from '../socketContext/context';
import Image from 'react-bootstrap/Image';
import Countdown from "./Countdown";

const Results = () => {
  const { totalVotes, roomInfo: {questionsAndAnswers, votingRound} } = useContext(SocketContext);
  const questions = questionsAndAnswers.map(({ question }) => question);
  const questionsDeDup = [...new Set(questions)];
  const [answers, setAnswers] = useState(questionsAndAnswers.filter(e => e.question === questionsDeDup[votingRound]));
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    setAnswers(questionsAndAnswers.filter(e => e.question === questionsDeDup[votingRound]));
  }, [questionsAndAnswers, votingRound]);

  return (
    <>
      {questionsDeDup[votingRound].includes('amazonaws') ?
        <Image
          src={questionsDeDup[votingRound]}
          rounded
          fluid
          className="my-2"
        /> :
        <p>{questionsDeDup[votingRound]}</p>
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
