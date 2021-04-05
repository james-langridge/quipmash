module.exports = {
  findRoom: (socket, gameRooms) => {
    let roomKey = 0;
    for (let keys1 in gameRooms) {
      if (gameRooms[keys1].players.some(e => e.playerID === socket.id)) {
          roomKey = keys1;
        }
      }

      return roomKey;
    },

  codeGenerator: () => {
    let code = "";
    let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
  },

  saveScore: (answer, roomInfo) => {
    const {username, votes} = answer;
    const score = Math.floor(votes / roomInfo.votesSubmitted * 1000);
    const newScore = {
      username: username,
      score: score
    }
    const index = roomInfo.scores.findIndex((obj => obj.username === username));
    if (index != -1) {
      const currentScore = roomInfo.scores[index].score;
      roomInfo.scores[index].score = currentScore + score;
    } else {
      roomInfo.scores = [...roomInfo.scores, newScore];
    }
  },

  sortScores: roomInfo => {
    roomInfo.scores.sort((a, b) => (a.score < b.score) ? 1 : -1);
  },

  getTotalVotes: roomInfo => {
    const questions = roomInfo.questionsAndAnswers.map(({ question }) => question);
    const questionsDeDup = [...new Set(questions)];
    let totalVotes = roomInfo.questionsAndAnswers
      .filter(e => e.question === questionsDeDup[roomInfo.votingRound])
      .reduce((prev, current) => (prev.votes + current.votes));
    if (typeof totalVotes === 'object') {
      totalVotes = totalVotes.votes;
    }

    return totalVotes;
  },

  shuffle: (questions) => {
    [...Array(questions.length)]
      .map((...args) => Math.floor(Math.random() * (args[1] + 1)))
      .reduce( (a, rv, i) => ([a[i], a[rv]] = [a[rv], a[i]]) && a, questions);
  }
};
