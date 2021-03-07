import React, { useState, useContext } from "react";
// import socket from "../socket";
import {SocketContext} from '../context/socket';
import styled from 'styled-components';

const Div = styled.div`
  width: 300px;
  margin: 200px auto 0;
`;

const SelectUsername = (props) => {
  const socket = useContext(SocketContext);
  const [username, setUsername] = useState('');

  const onChange = e => {
    setUsername(e.target.value);
  };

  const isValid = () => username.length > 2 ? true : false;

  const onSubmit = (e) => {
    e.preventDefault();
    socket.emit("input", username);
    props.onUsernameSelection(username);
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
