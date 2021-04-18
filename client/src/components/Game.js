import React, { useContext, useState, useEffect } from "react";
import SocketContext from '../socketContext/context';
import Container from 'react-bootstrap/Container';
import Prompt from "./Prompt";
import Voting from "./Voting";
import Rules from "./Rules";
import Countdown from "./Countdown";

const Game = (props) => {
  const { isUsernameSelected, countDownToGame, roomInfo: {roomKey, gameRound} } = useContext(SocketContext);
  const [isTimeUp, setIsTimeUp] = useState(false);

  if (!isUsernameSelected) {
    props.history.push('/');
  }

  return (
    <Container className="text-center">
      {(() => {
        switch (gameRound) {
          case 0:
            return <Rules />;
          case 1:
            return <Prompt />;
          case 2:
            return <Voting />;
          default:
            return null;
        }
      })()}
      {
        countDownToGame &&
        <Countdown
          functions={[isTimeUp, setIsTimeUp]}
          time={10}
          text={'until game starts'}
        />
      }
    </Container>
  );
}

export default Game;
