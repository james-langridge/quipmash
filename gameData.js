/* abstract */ class GameData {
  saveAnswers(answers) {}
  addVote(answer) {}
  getAnswers() {}
}

class InMemoryGameData extends GameData {
  constructor() {
    super();
    this.answers = [];
  }

  saveAnswers(answers) {
    this.answers = [...this.answers, ...answers];
  }

  addVote(answer) {
    const index = this.answers.findIndex((obj => obj.answer === answer));
    const currentVotes = this.answers[index].votes;
    this.answers[index].votes = currentVotes + 1;
  }

  getAnswers() {
    return this.answers;
  }
}

module.exports = {
  InMemoryGameData
};
