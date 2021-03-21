import React, { useEffect, useContext, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {SocketContext} from '../context/socket';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table'

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
    <Container className="py-5 text-center">
          {(() => {
            switch (status) {
              case 'voting':
                return (
                  <>
                    <Image
                      src={questionsDeDup[votingRound]}
                      rounded
                      fluid
                      className="my-2"
                    />
                    <br />
                    <h2>Vote for your favourite answer:</h2>
                    {answers.map(item =>
                      <>
                      <Button
                        key={item.userID}
                        value={item.answer}
                        variant="outline-primary"
                        onClick={handleClick}
                        className="mt-2"
                        >
                        {item.answer}
                      </Button>
                      <br />
                      </>
                    )}
                  </>
                );
              case 'waiting':
                return <div>Waiting for other votes...</div>;
              case 'results':
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
                )
              case 'endgame':
                return (
                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Player</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores.map((user, i) =>
                        <tr>
                          <td>{i+1}</td>
                          <td>{user.username}</td>
                          <td>{user.score}</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                )
              default:
                return null;
            }
          })()}
    </Container>
  );
}

export default Voting;
