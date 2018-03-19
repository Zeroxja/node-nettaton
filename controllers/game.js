
const mongoose = require('mongoose');

const Score = require('../models/score');
const User = require('../models/user');

// return all scores
exports.getAllScores = function(req, res, next) {
  let { offset, limit, correct } = req.query;
  var criteria = {};

  if (correct != undefined) {
    var criteria = { correct };
  }

  const query = Score.find(buildQuery(criteria))
    .skip(parseFloat(offset))
    .limit(parseFloat(limit))

  return Promise.all([query, Score.find(buildQuery(criteria)).count()])
    .then((results) => {
      res.json({
        scores: results[0],
        count: results[1],
        offset,
        limit
      });
    })
    .catch(err => res.json(err));
},

// return all scores for a user
exports.getScore = function(req, res, next) {
  const authedUser = req.user.username;
  const { username } = req.params;

  // check that the users score being requested matches the users token
  if (authedUser != username) {
    res.json({ auth: "unauthorised" })
  }

  User.findOne({ username }).populate('scores')
    .then((user) => {
      if (user.scores.length > 0) {
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
    // .then((user) => {
    //   return User.findOne({ _id: id }).populate('scores');
    // })
    .then((user) => {
      res.json(user[0]);
    })
    .catch((err) => {
      res.json(err);
    });
}

const buildQuery = (criteria) => {
  const query = {};

  if (criteria.correct) {
    query.correct = criteria.correct;
  }

  return query;
};