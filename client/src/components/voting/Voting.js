import React, { useContext } from "react";
import SocketContext from '../../socketContext/context';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import VotingChoices from "./VotingChoices";
import Waiting from "../common/Waiting";
import Results from "./Results";
import Leaderboard from "./Leaderboard";

const Voting = () => {
  const { gameStatus } = useContext(SocketContext);

  return (
    <Container className="py-5 text-center">
      <Row className="py-lg-5">
        <Col md={8} lg={6} className="mx-auto">
          {(() => {
            switch (gameStatus) {
              case 'voting':
                return <VotingChoices />;
              case 'waiting':
                return <Waiting />;
              case 'results':
                return <Results/>;
              case 'endgame':
                return <Leaderboard />;
              default:
                return null;
            }
          })()}
        </Col>
      </Row>
    </Container>
  );
}

export default Voting;
