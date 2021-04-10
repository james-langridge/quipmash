import React, { useContext } from "react";
import SocketContext from '../socketContext/context';
import Container from 'react-bootstrap/Container';
import Prompt from "./Prompt";
import Voting from "./Voting";
import Rules from "./Rules";

const Game = (props) => {
  const { isUsernameSelected, roomInfo: {gameRound} } = useContext(SocketContext);

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
    </Container>
  );
}

export default Game;
