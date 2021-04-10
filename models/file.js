const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema({
    description: {
      type: String,
      required: true,
      trim: true
    },
    file_url: {
      type: String,
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

module.exports = File = mongoose.model('Image', FileSchema);;
