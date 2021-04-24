import React, { useContext, useState, useEffect } from "react";
import SocketContext from '../../socketContext/context';
import { createGame, startGameCountDown, nextVotingRound } from '../../sockets/emit';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Alert from 'react-bootstrap/Alert';

const Dashboard = (props) => {
  const [setSelected, setGameItems] = props.functions;
  const { roomKey, roomInfo: {players, hasKeyBeenGenerated, isGameInProgress} } = useContext(SocketContext);
  const [playersOnline, setPlayersOnline] = useState();

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
          disabled={hasKeyBeenGenerated}
        >
          New game
        </Button>
        <Button
          variant="success"
          onClick={() => {
            startGameCountDown(roomKey, props.selected);
            setSelected([]);
            setGameItems([]);
          }}
          disabled={props.selected.length < playersOnline || playersOnline < 2 || !hasKeyBeenGenerated || isGameInProgress}
        >
          Start
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
