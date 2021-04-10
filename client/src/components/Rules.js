import React from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';

const Rules = () => {
  return (
    <Container>
      <ListGroup>
        <ListGroup.Item active>
          How To Play
        </ListGroup.Item>
        <ListGroup.Item>
          You will get a total of 90 seconds to come up with captions for two pictures of Eira, one at a time, 90 seconds total.
        </ListGroup.Item>
        <ListGroup.Item>
          Then you will see all the pictures, one at a time, and vote on the best captions.
        </ListGroup.Item>
        <ListGroup.Item>
          Then we see who wins the caption contest.
        </ListGroup.Item>
        <ListGroup.Item>
          The prize: honour and glory.
        </ListGroup.Item>
        <ListGroup.Item>
          There may well be bugs, I apologise if your laptop/phone explodes. That would be kind of cool though.
        </ListGroup.Item>
        <ListGroup.Item>
          Good luck!
        </ListGroup.Item>
      </ListGroup>
    </Container>
  );
}

export default Rules;
