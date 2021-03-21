import React, { useState, useContext } from "react";
import {SocketContext} from '../context/socket';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Div = styled.div`
  width: 300px;
  margin: 200px auto 0;
`;

const SelectUsername = (props) => {
  const socket = useContext(SocketContext);
  const isUsernameSelected = useSelector(state => state.user.isUsernameSelected);
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();

  if (isUsernameSelected) {
    props.history.push('/game');
  }

  const onChange = e => {
    setUsername(e.target.value);
  };

  const isValid = () => username.length > 2 ? true : false;

  const onSubmit = (e) => {
    e.preventDefault();
    socket.emit("input", username);
    socket.auth = { username };
    socket.connect();
    dispatch({ type: 'user/isUsernameSelected', payload: true })
    if (username === 'foobar') {
      dispatch({ type: 'user/isHost', payload: true })
    }
    props.history.push('/game');
  }

  return (
    <Container className="py-5 mt-5 text-center">
      <Row className="py-lg-5">
        <Col md={8} lg={6} className="mx-auto">
          <Form onSubmit={onSubmit}>
            <Form.Group>
              <Form.Label htmlFor="username" srOnly>Username</Form.Label>
              <Form.Control
                id="username"
                type="text"
                placeholder="Your username..."
                value={username}
                onChange={onChange}
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
        </Col>
      </Row>
    </Container>
  );
}

export default SelectUsername;
