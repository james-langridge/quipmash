import React, { useContext } from "react";
import SocketContext from '../socketContext/context';
import { createGame, startGame, nextVotingRound } from '../sockets/events';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Alert from 'react-bootstrap/Alert';

const Dashboard = () => {
  const { roomKey } = useContext(SocketContext);

  return (
    <>
      <ButtonGroup>
        <Button
          variant="info"
          onClick={() => createGame(roomKey)}
        >
          Create game
        </Button>
        <Button
          variant="success"
          onClick={() => startGame(roomKey)}
        >
          START
        </Button>
        <Button
          variant="primary"
          onClick={() => nextVotingRound(roomKey)}
        >
          ROUND++
        </Button>
      </ButtonGroup>
      <Alert
        variant="success"
        className="my-2"
      >
        <Alert.Heading>Room key: {roomKey}</Alert.Heading>
      </Alert>
    </>
  );
}

export default Dashboard;
