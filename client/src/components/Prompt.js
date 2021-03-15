import React, { useContext, useState } from "react";
import { useSelector } from 'react-redux';
import {SocketContext} from '../context/socket';

const Prompt = () => {
  const [caption, setCaption] = useState('');
  const [round, setRound] = useState(0);
  const users = useSelector(state => state.user.users);
  const socket = useContext(SocketContext);
  const index = users.findIndex(user => user.userID === socket.userID);

  const onChange = e => {
    setCaption(e.target.value);
  };

  const isValid = () => caption.length > 2 ? true : false;

  const onSubmit = (e) => {
    e.preventDefault();
    if (round === 2) {
      return;
    }
    const prevRound = round;
    const usersCopy = [...users];
    const user = usersCopy[index];
    user.game[round].answer = caption;
    socket.emit("update user", user);
    setRound(prevRound+1);
  }

  return (
    <div>
      {round < 2 ? (
        <div>
          <img src={users[index].game[round].prompt} />
          <form onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Hilarious caption here..."
              value={caption}
              onChange={onChange}
              className="text-input-field"
            />
            <button
              disabled={!isValid()}
            >
              Submit
            </button>
          </form>
        </div>
      ) : (
        <div>Waiting for other players...</div>
      )}
    </div>
  );
}

export default Prompt;
