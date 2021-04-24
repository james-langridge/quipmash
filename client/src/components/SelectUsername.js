import React, { useState, useContext, useEffect } from "react";
import SocketContext from '../socketContext/context';
import { socket } from '../sockets';
import { joinRoom, isKeyValid } from '../sockets/emit';
import { Link } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const SelectUsername = (props) => {
  const { error, isUsernameSelected } = useContext(SocketContext);
  const [username, setUsername] = useState('');
  const [roomKey, setRoomKey] = useState('');
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
  }

  useEffect(() => {
    if (isUsernameSelected) {
      props.history.push('/game');
    }
  }, [isUsernameSelected]);

  const isValid = () => username.length > 2 && roomKey.length === 5 && isIE === false ? true : false;

  const onSubmit = (e) => {
    e.preventDefault();
    connect();
    isKeyValid(roomKey);
  };

  return (
    <Container className="py-5 mt-5 text-center">
      <Row className="py-lg-5">
        <Col md={8} lg={6} className="mx-auto">
        {isIE && <p>Sorry, Internet Explorer is not supported. Please use a different browser.</p>}
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
              />
            </Form.Group>
            <Button
              variant="success"
              type="submit"
              disabled={!isValid()}
              className="my-2"
            >
              Let's go!
            </Button>
          </Form>
          {error && <p>{error}</p>}
          <p>Or <Link to="/login">log in</Link> to create a game.</p>
        </Col>
      </Row>
    </Container>
  );
}

export default SelectUsername;
