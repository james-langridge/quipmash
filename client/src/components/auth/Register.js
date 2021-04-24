import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerUser } from "../../actions/authActions";
import classnames from "classnames";
import styled from 'styled-components';
import { Form, Button } from 'react-bootstrap';
import { socket } from '../../sockets';

const Container = styled.div`
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 40px;
  padding-bottom: 40px;
`;

class Register extends Component {
  constructor() {
    super();
    this.state = {
      name: "",
      email: "",
      password: "",
      password2: "",
      errors: {}
    };
  }

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      const username = this.props.auth.user.name;
      socket.auth = { username };
      socket.username = username;
      socket.connect();
      this.props.history.push("/admin");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  onChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    const newUser = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2
    };

    this.props.registerUser(newUser, this.props.history);
  };

  render() {
    const { errors } = this.state;

    return (
      <Container className="text-center">
        <Form className="form-signin" noValidate onSubmit={this.onSubmit}>
          <h1 className="h3 mb-3 font-weight-normal">Please register</h1>
          <Form.Group>
            <Form.Label htmlFor="name" srOnly>Name</Form.Label>
            <Form.Control
              onChange={this.onChange}
              error={errors.name}
              value={this.state.name}
              id="name"
              type="text"
              placeholder="Name"
              required=""
              autoFocus=""
            />
            <span className="red-text">
              {errors.email}
              {errors.emailnotfound}
            </span>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="email" srOnly>Email</Form.Label>
              <Form.Control
                onChange={this.onChange}
                error={errors.email}
                value={this.state.email}
                id="email"
                type="email"
                placeholder="Email"
                required=""
              />
            <span className="red-text">{errors.email}</span>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="password" srOnly>Password</Form.Label>
              <Form.Control
                onChange={this.onChange}
                error={errors.password}
                value={this.state.password}
                id="password"
                type="password"
                placeholder="Password"
                required=""
              />
            <span className="red-text">{errors.password}</span>
          </Form.Group>
          <Form.Group>
            <Form.Label className="sr-only" htmlFor="password2">Confirm password</Form.Label>
              <Form.Control
                onChange={this.onChange}
                error={errors.password2}
                value={this.state.password2}
                id="password2"
                type="password"
                placeholder="Confirm password"
                required=""
              />
            <span className="red-text">{errors.password2}</span>
          </Form.Group>
          <Button block
            variant="primary"
            type="submit"
            size="lg"
            className="mb-3"
          >
            Sign up
          </Button>
          <p>Already have an account? <Link to="/login">Log in</Link></p>
        </Form>
      </Container>
    );
  }
}

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { registerUser }
)(withRouter(Register));
