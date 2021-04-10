import React, { useContext, useEffect, useState } from "react";
import SocketContext from '../socketContext/context';
import { submitVote } from '../sockets/emit';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Countdown from "./Countdown";

const VotingChoices = () => {
  const { totalVotes, roomInfo: {questionsAndAnswers, votingRound} } = useContext(SocketContext);
  const questions = questionsAndAnswers.map(({ question }) => question);
  const questionsDeDup = [...new Set(questions)];
  const [answers, setAnswers] = useState(questionsAndAnswers.filter(e => e.question === questionsDeDup[votingRound]));
  const [isTimeUp, setIsTimeUp] = useState(false);

  const handleClick = e => {
    const question = questionsDeDup[votingRound];
    const answer = e.target.value;
    submitVote(question, answer);
  }

  useEffect(() => {
    setAnswers(questionsAndAnswers.filter(e => e.question === questionsDeDup[votingRound]));
  }, [votingRound, questionsAndAnswers]);

  useEffect(() => {
    if (isTimeUp === true) {
      submitVote(questionsDeDup[votingRound], null);
    }
  }, [isTimeUp]);

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
      <br />
      <h2>Vote for your favourite answer:</h2>
      {answers.map(item => {
        if (item.answer !== '')
          return <>
                  <Button
                    key={item.playerID}
                    value={item.answer}
                    variant="outline-primary"
                    onClick={handleClick}
                    className="mt-2"
                    >
                    {item.answer}
                  </Button>
                  <br />
                </>
      })}
      <Countdown functions={[isTimeUp, setIsTimeUp]} time={20}/>
    </>
  );
}

export default VotingChoices;
