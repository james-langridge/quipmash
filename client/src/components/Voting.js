import React, { useEffect, useContext, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {SocketContext} from '../context/socket';
import Button from 'react-bootstrap/Button';

const Voting = () => {
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();
  const [status, setStatus] = useState('voting');
  const [totalVotes, setTotalVotes] = useState(0);
  const [votingRound, setVotingRound] = useState(0);
  const [scores, setScores] = useState([]);
  const promptsAndAnswers = useSelector(state => state.game.promptsAndAnswers);
  const questions = promptsAndAnswers.map(({ question }) => question);
  const questionsDeDup = [...new Set(questions)];
  const answers = promptsAndAnswers.filter(e => e.question === questionsDeDup[votingRound]);

  const handleClick = e => {
    const answer = e.target.value;
    socket.emit("submit vote", answer, questionsDeDup[votingRound]);
    setStatus('waiting');
  }

  useEffect(() => {
    socket.on("display results", (answers) => {
      dispatch({ type: 'game/setPrompts', payload: answers });
      const totalVotes = answers
        .filter(e => e.question === questionsDeDup[votingRound])
        .reduce((prev, current) => (prev.votes + current.votes));
      setTotalVotes(totalVotes);
      setStatus('results');
    });

    socket.on("next voting round", (votingRound, scores) => {
      setVotingRound(votingRound);
      setStatus('voting');
    });

    socket.on("endgame", (scores) => {
      setScores(scores);
      setStatus('endgame');
    });

    return () => {
      socket.off("display results");
      socket.off("next voting round");
      socket.off("endgame");
    }
  }, [answers]);

  return (
    <div>
      {(() => {
        switch (status) {
          case 'voting':
            return (
              <>
                <img src={questionsDeDup[votingRound]} />
                {answers.map(item =>
                  <Button
                    key={item.userID}
                    value={item.answer}
                    variant="primary"
                    onClick={handleClick}
                    >
                    {item.answer}
                  </Button>
                )}
              </>
            );
          case 'waiting':
            return <div>Waiting for other votes...</div>;
          case 'results':
            return (
              <>
                <img src={questionsDeDup[votingRound]} />
                {answers.map(item =>
                  <div>
                    "{item.answer}" from {item.username} has {item.votes} votes.  {Math.floor(item.votes / totalVotes * 1000)} points!
                  </div>
                )}
              </>
            )
          case 'endgame':
            return <div>End game leaderboard</div>;
          default:
            return null;
        }
      })()}
    </div>
  );
}

export default Voting;
