import React, { useEffect, useContext, useState } from "react";
import { useSelector } from 'react-redux';
import {SocketContext} from '../context/socket';
import Image from 'react-bootstrap/Image';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Countdown from "./Countdown";

const Prompt = () => {
  const socket = useContext(SocketContext);
  const questionsAndAnswers = useSelector(state => state.game.data.questionsAndAnswers);
  const [caption, setCaption] = useState('');
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [questionRound, setQuestionRound] = useState(0);
  const [userQuestions, setUserQuestions] = useState(questionsAndAnswers.filter(e => e.playerID === socket.id));

  const onChange = e => {
    setCaption(e.target.value);
  };

  const isValid = () => caption.length > 2 ? true : false;

  useEffect(() => {
    if (isTimeUp === true) {
      for (let i = questionRound; i < 2; i++) {
        const newState = [...userQuestions];
        newState[questionRound] = { ...newState[questionRound], answer: '' };
        setUserQuestions(newState);
        setQuestionRound(questionRound+1);
      }
    }
  }, [isTimeUp, questionRound]);

  const onSubmit = (e) => {
    e.preventDefault();
    const newState = [...userQuestions];
    newState[questionRound] = { ...newState[questionRound], answer: caption };
    setUserQuestions(newState);
    setCaption('');
    setQuestionRound(questionRound+1);
  }

  useEffect(() => {
    if (questionRound === 2) {
      socket.emit("answers submitted", userQuestions);
    }
  }, [userQuestions, questionRound]);

  return (
    <Container className="py-5 text-center">
      {questionRound < 2 ? (
          <Row className="py-lg-5">
            <Col md={8} lg={6} className="mx-auto">
              <Image
                src={userQuestions[questionRound].question}
                rounded
                fluid
                className="my-2"
              />
              <Form onSubmit={onSubmit}>
                <Form.Group>
                  <Form.Label htmlFor="caption">Caption contest {questionRound+1} of 2:</Form.Label>
                  <Form.Control
                    id="caption"
                    type="text"
                    placeholder="Hilarious caption here..."
                    value={caption}
                    onChange={onChange}
                    autoFocus={true}
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!isValid()}
                >
                  Submit
                </Button>
              </Form>
              <Countdown functions={[isTimeUp, setIsTimeUp]} time={20} />
            </Col>
          </Row>
      ) : (
        <p>Waiting for other players...</p>
      )}
    </Container>
  );
}

export default Prompt;
