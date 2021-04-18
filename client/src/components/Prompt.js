import React, { useEffect, useContext, useState } from "react";
import SocketContext from '../socketContext/context';
import { socket } from '../sockets';
import { submitAnswers } from '../sockets/emit';
import Image from 'react-bootstrap/Image';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Countdown from "./Countdown";
import Waiting from "./Waiting";

const Prompt = () => {
  const { roomInfo: {questionsAndAnswers, roomKey} } = useContext(SocketContext);
  const [answer, setAnswer] = useState('');
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [questionRound, setQuestionRound] = useState(0);
  const [userQuestions, setUserQuestions] = useState(questionsAndAnswers.filter(e => e.playerID === socket.id));

  const onChange = e => {
    setAnswer(e.target.value);
  };

  const isValid = () => answer.length > 2 ? true : false;

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
    newState[questionRound] = { ...newState[questionRound], answer: answer };
    setUserQuestions(newState);
    setAnswer('');
    setQuestionRound(questionRound+1);
  }

  useEffect(() => {
    if (questionRound === 2) {
      submitAnswers(roomKey, userQuestions);
    }
  }, [userQuestions, questionRound]);

  return (
    <Container className="py-5 text-center">
      <Row className="py-lg-5">
        <Col md={8} lg={6} className="mx-auto">
          {questionRound < 2 ? (
            <>
              {userQuestions[questionRound].question.includes('amazonaws') ?
                <Image
                  src={userQuestions[questionRound].question}
                  rounded
                  fluid
                  className="my-2"
                /> :
                <p>{userQuestions[questionRound].question}</p>
              }
              <Form onSubmit={onSubmit}>
                <Form.Group>
                  <Form.Control
                    id="answer"
                    type="text"
                    placeholder={`Answer ${questionRound+1} of 2...`}
                    value={answer}
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
              <Countdown
                functions={[isTimeUp, setIsTimeUp]}
                time={90}
                text={'left to submit answers'}
              />
            </>
          ) : ( <Waiting /> )}
        </Col>
      </Row>
    </Container>
  );
}

export default Prompt;
