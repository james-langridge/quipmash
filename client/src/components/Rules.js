import React from "react";
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup'

const Rules = () => {
  return (
    <Container className="text-center">
      <ListGroup>
        <ListGroup.Item active>
          How To Play
        </ListGroup.Item>
        <ListGroup.Item>rule 1</ListGroup.Item>
        <ListGroup.Item>
          rule 2
        </ListGroup.Item>
        <ListGroup.Item>rule 3</ListGroup.Item>
      </ListGroup>
    </Container>
  );
}

export default Rules;
