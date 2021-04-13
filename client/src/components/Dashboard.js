import React, { useContext, useState, useEffect } from "react";
import SocketContext from '../socketContext/context';
import { createGame, startGame, nextVotingRound } from '../sockets/emit';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Alert from 'react-bootstrap/Alert';

const Dashboard = (props) => {
  const { roomKey, roomInfo: {players} } = useContext(SocketContext);
  const [playersOnline, setPlayersOnline] = useState(99);

  useEffect(() => {
    setPlayersOnline(
      players.reduce((count, player) => {
        return player.isConnected === true ? ++count : count;
      }, 0)
    );
  }, [players]);

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
          onClick={() => startGame(roomKey, props.selected)}
          disabled={props.selected.length < playersOnline}
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
