import React, { useContext, useEffect, useState } from "react";
import SocketContext from '../socketContext/context';
import { submitVote } from '../sockets/emit';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Countdown from "./Countdown";
import { socket } from '../sockets';

const VotingChoices = () => {
  const { totalVotes, roomInfo: {roomKey, questionsAndAnswers, votingRound} } = useContext(SocketContext);
  const questions = [...new Set(questionsAndAnswers.map(({ question }) => question))];
  const [answers, setAnswers] = useState(questionsAndAnswers.filter(e => e.question === questions[votingRound]));
  const [isOwnAnswer, setIsOwnAnswer] = useState(answers.some(e => e.playerID === socket.id));
  const [isTimeUp, setIsTimeUp] = useState(false);

  const handleClick = e => {
    const question = questions[votingRound];
    const answer = e.target.value;
    submitVote(roomKey, question, answer);
  }

  useEffect(() => {
    if (answers.some(e => e.playerID === socket.id)) {
      setIsOwnAnswer(true);
    } else {
      setIsOwnAnswer(false);
    };
  }, [answers]);

  useEffect(() => {
    setAnswers(questionsAndAnswers.filter(e => e.question === questions[votingRound]));
  }, [votingRound, questionsAndAnswers]);

  useEffect(() => {
    if (isTimeUp === true) {
      submitVote(roomKey, questions[votingRound], null);
    }
  }, [isTimeUp]);

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
      <br />
      {
        isOwnAnswer ?
        <h5>You can't vote for you own answer</h5> :
        <h5>Vote for your favourite answer:</h5>
      }
      {answers.map(item => {
        if (item.answer !== '')
          return <>
                  <Button
                    key={item.questionID}
                    value={item.answer}
                    variant="outline-primary"
                    onClick={handleClick}
                    className="mt-2"
                    disabled={isOwnAnswer}
                    >
                    {item.answer}
                  </Button>
                  <br />
                </>
      })}
      <Countdown
        functions={[isTimeUp, setIsTimeUp]}
        time={20}
        text={'left to vote'}
      />
    </>
  );
}

export default VotingChoices;
