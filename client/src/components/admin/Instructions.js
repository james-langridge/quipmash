import React from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import { Link } from "react-router-dom";

const Instructions = () => {
  return (
    <ListGroup variant="flush">
      <ListGroup.Item>Click New Game to generate a new room code.</ListGroup.Item>
      <ListGroup.Item>Players enter the code here: <Link to="/" target="_blank">https://quipmash.herokuapp.com/</Link></ListGroup.Item>
      <ListGroup.Item>Select questions to play with.  You must select at least as many questions as there are players.</ListGroup.Item>
      <ListGroup.Item>Click Start.</ListGroup.Item>
      <ListGroup.Item>To play again, click New Game, choose questions, and click Start again.</ListGroup.Item>
    </ListGroup>
  );
}

export default Instructions;
