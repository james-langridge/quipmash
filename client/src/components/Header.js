import React from "react";
import Container from 'react-bootstrap/Container';
import PlayerList from "./PlayerList";

const Header = () => {

  return (
    <Container className="text-center">
      <h1>Quipmash</h1>
      <PlayerList />
    </Container>
  );
}

export default Header;
