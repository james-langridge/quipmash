export const isUsernameSelected = bool => {
  return {
    type: 'player/isUsernameSelected',
    payload: bool
  }
}

export const setPlayers = players => {
  return {
    type: 'player/setPlayers',
    payload: players
  }
}

export const isPlayerConnected = bool => {
  return {
    type: 'player/isPlayerConnected',
    payload: bool
  }
}

export const addPlayer = player => {
  return {
    type: 'player/addPlayer',
    payload: player
  }
}

export const sortPlayers = () => {
  return {
    type: 'player/sortPlayers'
  }
}

export const updatePlayer = player => {
  return {
    type: 'player/updatePlayer',
    payload: player
  }
}
