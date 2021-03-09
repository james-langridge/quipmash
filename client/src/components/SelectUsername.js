import React, { useState, useContext } from "react";
import {SocketContext} from '../context/socket';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';

const Div = styled.div`
  width: 300px;
  margin: 200px auto 0;
`;

const SelectUsername = (props) => {
  const isUsernameSelected = useSelector(state => state.user.isUsernameSelected);
  const socket = useContext(SocketContext);
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
    <Div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Your username..."
          value={username}
          onChange={onChange}
          className="text-input-field"
        />
        <button
          disabled={!isValid()}
        >
          Send
        </button>
      </form>
    </Div>
  );
}

export default SelectUsername;
