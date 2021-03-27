const initialState = {
  questionsAndAnswers: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case 'game/setPrompts':
      return {
        ...state,
        questionsAndAnswers: action.payload
      };
    default:
      return state;
  }
}
