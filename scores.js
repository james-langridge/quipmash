/* abstract */ class Scores {
  saveScores(answer) {}
  getScores() {}
}

class InMemoryScores extends Scores {
  constructor() {
    super();
    this.scores = [];
  }

  saveScore(answer, totalVotes) {
    const {username, votes} = answer;
    const score = Math.floor(votes / totalVotes * 1000);
    const newEntry = {
      username: username,
      score: score
    }
    const index = this.scores.findIndex((obj => obj.username === username));
    if (index != -1) {
      const currentScore = this.scores[index].score;
      this.scores[index].score = currentScore + score;
    } else {
      console.log('newEntry:', newEntry);
      this.scores = [...this.scores, newEntry];
    }
  }

  getScores() {
    return this.scores;
  }
}

module.exports = {
  InMemoryScores
};
