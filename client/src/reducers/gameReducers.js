const initialState = {
  data: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case 'game/setData':
      return {
        ...state,
        data: action.payload
      };
    default:
      return state;
  }
}
