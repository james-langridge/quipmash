const initialState = {
  promptsAndAnswers: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case 'game/setPrompts':
      return {
        ...state,
        promptsAndAnswers: action.payload
      };
    default:
      return state;
  }
}
