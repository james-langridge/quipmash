import React, { useContext, useState, useEffect } from "react";
import SocketContext from '../../socketContext/context';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const PlayerList = () => {
  const { roomInfo: {roomKey, players} } = useContext(SocketContext);
  const [playersOnline, setPlayersOnline] = useState([]);

  useEffect(() => {
    const newState = [];
    players.map((player) => {
      player.isConnected && newState.push(player);
    });
    setPlayersOnline(newState);
  }, [players]);

  return (
    <>
      {players.length > 0 &&
        <Row className="justify-content-md-center">
          <Col md={4} className="justify-content-center">
            <ListGroup className="my-2">
              <ListGroup.Item active className="d-flex justify-content-center align-items-center">
                Players in room {roomKey}
              </ListGroup.Item>
              {playersOnline.map((player) =>
                <ListGroup.Item
                  key={player.playerID}
                  className="d-flex justify-content-center align-items-center"
                >
                  {player.username}
                </ListGroup.Item>
              )}
            </ListGroup>
          </Col>
        </Row>
      }
    </>
  );
}

export default PlayerList;
