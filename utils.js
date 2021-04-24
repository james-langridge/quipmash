module.exports = {
  findRoom: function(socket, gameRooms) {
    let roomKey = 0;
    for (let keys1 in gameRooms) {
      if (gameRooms[keys1].players.some(e => e.playerID === socket.id)) {
          roomKey = keys1;
        }
      }

      return roomKey;
    },

  codeGenerator: function() {
    let code = "";
    let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
  },

  saveScore: function(answer, roomInfo) {
    const {username, votes} = answer;
    const newScore = Math.floor(votes / this.getTotalVotes(roomInfo) * 1000) || 0;
    const playerIndex = roomInfo.players.findIndex((obj => obj.username === username));
    const currentScore = roomInfo.players[playerIndex].score;
    roomInfo.players[playerIndex].score = currentScore + newScore;
  },

  getTotalVotes: function(roomInfo) {
    const questions = [...new Set(roomInfo.questionsAndAnswers.map(({ question }) => question))];
    let totalVotes = roomInfo.questionsAndAnswers
      .filter(e => e.question === questions[roomInfo.votingRound])
      .reduce((prev, current) => (prev.votes + current.votes));
    if (typeof totalVotes === 'object') {
      totalVotes = totalVotes.votes;
    }

    return totalVotes;
  },

  shuffle: function(questions) {
    [...Array(questions.length)]
      .map((...args) => Math.floor(Math.random() * (args[1] + 1)))
      .reduce( (a, rv, i) => ([a[i], a[rv]] = [a[rv], a[i]]) && a, questions);
  }
};
