import React, { useEffect, useState, useContext } from "react";
import {SocketContext} from '../context/socket';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const SelectUsername = (props) => {
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();
  const isUsernameSelected = useSelector(state => state.player.isUsernameSelected);
  const [username, setUsername] = useState('');
  const [roomKey, setRoomKey] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isIE, setIsIE] = useState(false);

  if (/*@cc_on!@*/false || !!document.documentMode) {
    setIsIE(true);
  }

  const onChangeUsername = e => {
    setUsername(e.target.value);
  };

  const onChangeRoomKey = e => {
    setRoomKey(e.target.value);
  };

  const connect = () => {
    socket.auth = { username };
    socket.username = username;
    console.log(`Connecting new user ${username} to server...`);
    socket.connect();
    dispatch({ type: 'player/isUsernameSelected', payload: true });
  }

  useEffect(() => {
    socket.on("keyNotValid", () => {
      setErrorText('Game code does not exist. Please try again.');
    });

    socket.on("keyIsValid", roomKey => {
      socket.emit("joinRoom", roomKey);
      props.history.push('/game');
    });

    socket.on("isHost", roomKey => {
      dispatch({ type: 'player/isHost', payload: true });
      props.history.push('/game');
    });

    socket.on("pleaseWaitForNextGame", () => {
      setErrorText('Game already started. Please wait for the next game');
    });

    return () => {
      socket.off("keyNotValid");
      socket.off("keyIsValid");
      socket.off("pleaseWaitForNextGame");
    }
  }, []);

  const isValid = () => username.length > 2 && roomKey.length === 5 && isIE === false ? true : false;

  const onSubmit = (e) => {
    e.preventDefault();
    connect();
    socket.emit("isKeyValid", roomKey);
  };

  return (
    <Container className="py-5 mt-5 text-center">
      <Row className="py-lg-5">
        <Col md={8} lg={6} className="mx-auto">
        {isIE && <p>SOrry, Internet Explorer is not supported. Please use a different browser.</p>}
          <Form onSubmit={onSubmit}>
            <Form.Group>
              <Form.Label htmlFor="roomKey" srOnly>Game Code</Form.Label>
              <Form.Control
                id="roomKey"
                type="text"
                placeholder="Enter the game code..."
                value={roomKey}
                onChange={onChangeRoomKey}
                className="text-input-field"
                autoFocus={true}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor="username" srOnly>Username</Form.Label>
              <Form.Control
                id="username"
                type="text"
                placeholder="Your username..."
                value={username}
                onChange={onChangeUsername}
                className="text-input-field"
                autoFocus={true}
              />
            </Form.Group>
            <Button
              variant="success"
              type="submit"
              disabled={!isValid()}
            >
              Chalo let's go!
            </Button>
          </Form>
          {errorText && <p>{errorText}</p>}
        </Col>
      </Row>
    </Container>
  );
}

export default SelectUsername;
