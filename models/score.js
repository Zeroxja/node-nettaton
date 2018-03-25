const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define our model
const scoreSchema = new Schema({
  answer: String,
  correct: { type: Boolean, default: false },
  question: {
    ip_address: String,
    network: String,
    question_type: String,
    correct_answer: String
  }
});

// Create the model class
const Score = mongoose.model('score', scoreSchema);

// Export the model
module.exports = Score;
