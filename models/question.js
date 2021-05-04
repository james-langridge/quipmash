const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    question: {
      type: String,
      trim: true,
      required: true
    },
    created_by: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = Question = mongoose.model('Prompt', QuestionSchema);;
