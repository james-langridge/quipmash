export const isUsernameSelected = bool => {
  return {
    type: 'player/isUsernameSelected',
    payload: bool
  }
}

export const isHost = bool => {
  return {
    type: 'player/isHost',
    payload: bool
  }
}
