const initialState = {
  isUsernameSelected: false,
  isHost: false,
  users: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case 'user/isUsernameSelected':
      return {
        ...state,
        isUsernameSelected: action.payload
      };
    case 'user/isUserConnected': {
      const users = [...state.users];
      users.forEach((user) => {
        if (user.self) {
          user.connected = action.payload;
        }
      });
      return {
        ...state,
        users: users
      };
    }
    case 'user/isHost':
      return {
        ...state,
        isHost: action.payload
      };
    case 'user/setUsers':
      return {
        ...state,
        users: action.payload
      };
    case 'user/addUser':
      console.log('adding user to redux, new users:', [...state.users, action.payload])
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    case 'user/sortUsers': {
      const users = [...state.users];
      users.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
      return {
        ...state,
        users: users
      };
    }
    default:
      return state;
  }
}
