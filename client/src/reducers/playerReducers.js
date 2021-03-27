const initialState = {
  isUsernameSelected: false,
  isHost: false,
  players: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case 'player/isUsernameSelected':
      return {
        ...state,
        isUsernameSelected: action.payload
      };
    case 'player/isPlayerConnected': {
      const players = [...state.players];
      players.forEach((player) => {
        if (player.self) {
          player.connected = action.payload;
        }
      });
      return {
        ...state,
        players: players
      };
    }
    case 'player/setPlayers':
      return {
        ...state,
        players: action.payload
      };
    case 'player/addPlayer':
      console.log('adding player to redux, new players:', [...state.players, action.payload])
      return {
        ...state,
        players: [...state.players, action.payload]
      };
    case 'player/updatePlayer':
      return {
        ...state,
        players: state.players.map(player => player.userID === action.payload.userID ?
            action.payload :
            player
          )
        };
    case 'player/sortPlayers': {
      const players = [...state.players];
      players.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
      return {
        ...state,
        players: players
      };
    }
    default:
      return state;
  }
}
