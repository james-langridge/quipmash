import React, { useContext, useState, useEffect } from "react";
import SocketContext from '../../socketContext/context';
import { createGame, startGameCountDown, nextVotingRound } from '../../sockets/emit';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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
    <Row>
      <Col>
        <ButtonGroup>
          <Button
            variant="info"
            size="lg"
            onClick={() => createGame(roomKey)}
            disabled={hasKeyBeenGenerated}
          >
            New game
          </Button>
          <Button
            variant="success"
            size="lg"
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
      </Col>
      <Col sm={7} md={6} lg={4} className="text-center">
        <Alert variant="success">
          <Alert.Heading>Room key: {roomKey}</Alert.Heading>
        </Alert>
      </Col>
    </Row>
  );
}

export default Dashboard;
