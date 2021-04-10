const isEmpty = require("is-empty");

const initialState = {
  isAuthenticated: false,
  user: {},
  loading: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case 'auth/setCurrentUser':
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload
      };
    case 'auth/userLoading':
      return {
        ...state,
        loading: true
      };
    default:
      return state;
  }
}
