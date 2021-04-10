import React, { useState } from "react";
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';

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
        setQuestion('');
        getQuestionList()
      } else {
        setErrorMsg('Please enter a question.');
      }
    } catch (error) {
      console.log(error.response.data);
      // error.response && setErrorMsg(error.response.data);
    }
  };

  return (
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
  );
}

export default QuestionForm;
