
const mongoose = require('mongoose');

const Score = require('../models/score');
const User = require('../models/user');

// return all scores
exports.getAllScores = function(req, res, next) {
  Score.find({})
    .then(score => res.json(score))
    .catch(err => res.json(err));
},

// return all scores for a user
exports.getScore = function(req, res, next) {
  const { username } = req.params;

  if (!username) {
    return res.status(422).send({ error: 'You must provide an id, score?id=1234' });
  }

  User.findOne({ username }).populate('scores')
    .then((user) => {
      if (user) {
        res.json(user.scores);
      } else {
        res.status(202).send({ info: `No user could be found with and username of ${username}` });
      }
    })
    .catch((err) => {
      res.json(err);
    });
}

// save a score 
exports.saveScore = function(req, res, next) {
  const { userAnswer, actualAnswer, id } = req.body;

  if (!userAnswer || !actualAnswer || !id) {
    return res.status(422).send({ error: 'You must provide userAnswer, actualAnswer and id' });
  }

  var correct = false;
  // check if the answer was correct
  if (actualAnswer === userAnswer) {
    var correct = true;
  }

  // create score model
  const score = new Score({
    userAnswer,
    actualAnswer,
    correct
  });

  // find the correct user
  User.findOne({ _id: id })
    .then((user) => {
      user.scores.push(score);
      return Promise.all([
        score.save(),
        user.save()
      ])
    })
    .then((user) => {
      return User.findOne({ _id: id }).populate('scores');
    })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      res.json(err);
    });
}
