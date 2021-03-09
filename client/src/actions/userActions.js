export const isUsernameSelected = bool => {
  return {
    type: 'user/isUsernameSelected',
    payload: bool
  }
}

export const isHost = bool => {
  return {
    type: 'user/isHost',
    payload: bool
  }
}

export const setUsers = users => {
  return {
    type: 'user/setUsers',
    payload: users
  }
}

export const isUserConnected = bool => {
  return {
    type: 'user/isUserConnected',
    payload: bool
  }
}

export const addUser = user => {
  return {
    type: 'user/addUser',
    payload: user
  }
}

export const sortUsers = () => {
  return {
    type: 'user/sortUsers'
  }
}

export const updateUser = user => {
  return {
    type: 'user/updateUser',
    payload: user
  }
}
