const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define our model
const scoreSchema = new Schema({
  userAnswer: String,
  actualAnswer: String,
  correct: { type: Boolean, default: false }
});

// Create the model class
const Score = mongoose.model('score', scoreSchema);

// Export the model
module.exports = Score;
