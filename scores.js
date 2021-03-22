/* abstract */ class Scores {
  saveScores(answer) {}
  getScores() {}
  reset() {}
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
    this.scores.sort((a, b) => (a.score < b.score) ? 1 : -1)
    return this.scores;
  }

  reset() {
    this.scores = [];
  }
}

module.exports = {
  InMemoryScores
};
