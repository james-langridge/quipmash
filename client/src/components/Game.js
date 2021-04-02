import React, { useEffect, useContext, useState } from "react";
import {SocketContext} from '../context/socket';
import { useDispatch, useSelector } from 'react-redux';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Alert from 'react-bootstrap/Alert';
import Prompt from "./Prompt";
import Voting from "./Voting";
import Rules from "./Rules";

const Game = (props) => {
  const socket = useContext(SocketContext);
  const isHost = useSelector(state => state.player.isHost);
  const isUsernameSelected = useSelector(state => state.player.isUsernameSelected);
  const [gameRound, setGameRound] = useState(0);
  const [roomKey, setRoomKey] = useState('');
  const dispatch = useDispatch();

  if (!isUsernameSelected) {
    dispatch({ type: 'player/isUsernameSelected', payload: false })
    props.history.push('/');
  }

  const createGame = () => {
    socket.emit("getRoomCode", roomKey);
  }

  const startGame = () => {
    socket.emit("start game", roomKey);
  }

  const nextVotingRound = () => {
    socket.emit("next voting round", roomKey);
  }

  useEffect(() => {
    console.log(`New roomKey: ${roomKey}`)
  }, [roomKey]);

  useEffect(() => {
    socket.on("roomCreated", (key) => {
      console.log(`Room created: ${key}`);
      setRoomKey(key);
      if (!isHost) {
        socket.emit("joinRoom", key);
      }
    });

    socket.on("start game", (gameData) => {
      dispatch({ type: 'game/setData', payload: gameData });
      setGameRound(gameData.gameRound);
    });

    socket.on("start voting round", (gameData) => {
      dispatch({ type: 'game/setData', payload: gameData });
      setGameRound(gameData.gameRound);
    });

    return () => {
      socket.off("start game");
      socket.off("start voting round");
      socket.off("roomCreated");
    }
  }, []);

  return (
    <Container className="text-center">
      {isHost &&
        <>
          <ButtonGroup>
          <Button
            variant="info"
            onClick={() => createGame()}
          >
            Create game
          </Button>
            <Button
              variant="success"
              onClick={() => startGame()}
            >
              START
            </Button>
            <Button
              variant="primary"
              onClick={() => nextVotingRound()}
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
      }
      {!isHost &&(() => {
        switch (gameRound) {
          case 0:
            return (
              <>
                <Rules />
              </>
            );
          case 1:
            return <Prompt />;
          case 2:
            return <Voting />;
          default:
            return null;
        }
      })()}
    </Container>
  );
}

export default Game;
