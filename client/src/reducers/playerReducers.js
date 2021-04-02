const initialState = {
  isUsernameSelected: false,
  isHost: false,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case 'player/isUsernameSelected':
      return {
        ...state,
        isUsernameSelected: action.payload
      };
    case 'player/isHost':
      return {
        ...state,
        isHost: action.payload
      };
    default:
      return state;
  }
}
