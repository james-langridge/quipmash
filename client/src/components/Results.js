import React, { useContext, useEffect, useState } from "react";
import SocketContext from '../socketContext/context';
import Image from 'react-bootstrap/Image';

const Results = () => {
  const { totalVotes, questionsAndAnswers, votingRound } = useContext(SocketContext);
  const questions = questionsAndAnswers.map(({ question }) => question);
  const questionsDeDup = [...new Set(questions)];
  const [answers, setAnswers] = useState(questionsAndAnswers.filter(e => e.question === questionsDeDup[votingRound]));

  useEffect(() => {
    setAnswers(questionsAndAnswers.filter(e => e.question === questionsDeDup[votingRound]));
  }, [votingRound, questionsAndAnswers]);

  return (
    <>
      <Image
        src={questionsDeDup[votingRound]}
        rounded
        fluid
        className="my-2"
      />
      {answers.map(answer =>
        <p>
          "{answer.answer}" has {answer.votes} votes... {Math.floor(answer.votes / totalVotes * 1000)} points for {answer.username}!
        </p>
      )}
    </>
  );
}

export default Results;
