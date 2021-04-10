import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";

export const registerUser = (userData, history) => dispatch => {
  axios
    .post("/users/register", userData)
    .then(res => history.push("/login"))
    .catch(err =>
      dispatch({
        type: 'getErrors',
        payload: err.response.data
      })
    );
};

export const loginUser = userData => dispatch => {
  axios
    .post("/users/login", userData)
    .then(res => {
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);
      setAuthToken(token);
      const decoded = jwt_decode(token);
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: 'getErrors',
        payload: err.response.data
      })
    );
};

export const setCurrentUser = decoded => {
  return {
    type: 'auth/setCurrentUser',
    payload: decoded
  };
};

export const setUserLoading = () => {
  return {
    type: 'auth/userLoading'
  };
};

export const logoutUser = () => dispatch => {
  localStorage.removeItem("jwtToken");
  setAuthToken(false);
  dispatch(setCurrentUser({}));
};
