import React from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Rules = () => {
  return (
    <Row className="justify-content-md-center">
      <Col md={8} className="justify-content-center">
        <ListGroup variant="flush">
          <ListGroup.Item className="h1">How to play</ListGroup.Item>
          <ListGroup.Item>When the game starts you will have 90 seconds to answer two questions.</ListGroup.Item>
          <ListGroup.Item>That's 90 seconds total; not per question.</ListGroup.Item>
          <ListGroup.Item>Then you vote on your favourite answer to each question.</ListGroup.Item>
          <ListGroup.Item>Each question will have two answers to choose from.</ListGroup.Item>
        </ListGroup>
      </Col>
    </Row>
  );
}

export default Rules;
