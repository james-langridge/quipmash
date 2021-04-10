const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PromptSchema = new Schema({
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

module.exports = Prompt = mongoose.model('Prompt', PromptSchema);;
