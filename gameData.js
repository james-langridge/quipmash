/* abstract */ class GameData {
  saveAnswers(answers) {}
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

  getAnswers() {
    return this.answers;
  }
}

module.exports = {
  InMemoryGameData
};
