const initialState = {};

export default function(state = initialState, action) {
  switch (action.type) {
    case 'getErrors':
      return action.payload;
    default:
      return state;
  }
}
