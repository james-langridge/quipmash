import React, { useState } from "react";
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { Link } from "react-router-dom";

const QuestionForm = (props) => {
  const [errorMsg, setErrorMsg, getQuestionList] = props.functions;
  const [question, setQuestion] = useState('');

  const handleInputChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleQuestionSubmit = async (event) => {
    event.preventDefault();
    try {
      if (question.trim() !== '') {
        setErrorMsg('');
        const questionData = {
          question: question,
          created_by: props.userId
        };
        await axios.post('prompt/save', questionData);
      } else {
        setErrorMsg('Please enter a question.');
      }
    } catch (error) {
      console.log(error.response.data);
      // error.response && setErrorMsg(error.response.data);
    }
    setQuestion('');
    getQuestionList();
  };

  return (
    <>
      <Form className="form-upload" onSubmit={handleQuestionSubmit}>
        {errorMsg && <p className="errorMsg">{errorMsg}</p>}
        <Row>
          <Col>
            <InputGroup className="mb-3">
              <Form.Control
                type="text"
                name="question"
                value={question}
                placeholder="Add a question..."
                onChange={handleInputChange}
              />
              <InputGroup.Append>
                <Button variant="primary" type="submit">Save question</Button>
              </InputGroup.Append>
            </InputGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group>
              <Form.Control
                type="hidden"
                name="userId"
                value={props.userId}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      <p>Click New Game to generate a new room code.</p>
      <p>Players enter the code here: <Link to="/">https://quipmash.herokuapp.com/</Link></p>
      <p>Select questions to play with.  You must select at least as many questions as there are players.</p>
      <p>Click Start.</p>
      <p>To play again, click New Game, choose questions, and click Start again.</p>
    </>
  );
}

export default QuestionForm;
