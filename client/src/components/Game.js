import React, { useEffect, useContext, useState } from "react";
import {SocketContext} from '../context/socket';
import { useDispatch, useSelector } from 'react-redux';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Prompt from "./Prompt";
import Players from "./Players";
import Voting from "./Voting";
import Rules from "./Rules";

const Game = (props) => {
  const socket = useContext(SocketContext);
  const isHost = socket.username === 'foobar';
  const isUsernameSelected = useSelector(state => state.player.isUsernameSelected);
  const players = useSelector(state => state.player.players);
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

  const startGame = (restart) => {
    socket.emit("start game", restart);
  }

  const nextVotingRound = () => {
    socket.emit("next voting round");
  }

  useEffect(() => {
    socket.on("roomCreated", (key) => {
      setRoomKey(key);
      socket.emit("joinRoom", key);
    });

    socket.on("leaveRoom", () => {
      socket.disconnect();
      window.location.reload(true);
    });

    socket.on("start game", (gameData) => {
      dispatch({ type: 'game/setPrompts', payload: gameData.questionsAndAnswers });
      setGameRound(gameData.gameRound);
    });

    socket.on("start voting round", (gameData) => {
      dispatch({ type: 'game/setPrompts', payload: gameData.questionsAndAnswers });
      setGameRound(gameData.gameRound);
    });

    return () => {
      socket.off("start game");
      socket.off("start voting round");
      socket.off("roomCreated");
      socket.off("leaveRoom");
    }
  }, []);

  return (
    <Container className="text-center">
      {isHost &&
        <>
          <ButtonGroup>
          <Button
            variant="success"
            onClick={() => createGame()}
          >
            Create game
          </Button>
            <Button
              variant="success"
              onClick={() => startGame(false)}
            >
              START
            </Button>
            <Button
              variant="primary"
              onClick={() => nextVotingRound()}
            >
              ROUND++
            </Button>
            <Button
              variant="danger"
              onClick={() => startGame(true)}
            >
              RESTART
            </Button>
          </ButtonGroup>
          <p>Room key: {roomKey}</p>
        </>
      }
      {(() => {
        switch (gameRound) {
          case 0:
            return (
              <>
                <Players players={players} />
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
