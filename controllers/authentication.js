const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  // iat = issued at time
  console.log(timestamp);
  console.log(user.id);
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  // User has already had their email and password auth'd
  // we just need to give them a token
  res.send({ token: tokenForUser(req.user) });
}

exports.signup = function(req, res, next) {
  const body = req.body;

  const username = body.username;
  const email = body.email;
  const password = body.password;

  if (!email || !password || !username) {
    return res.status(422).send({ error: 'You must provide email, password and username' });
  }
  
  // See if a user with the given email exists
  User.findOne({ email: email }, function(emailErr, existingEmail) {
    if (emailErr) { return next(emailErr); }

    // If a user with email does exist, return an error
    if (existingEmail) {
      // 422 is a http status for bad data
      return res.status(422).send({ error: 'Email is in use' });
    }

    // See if a user with the given username exists
    User.findOne({ username: username }, function(usernameErr, existingUsername) {
      if (usernameErr) { return next(usernameErr); }
  
      // If a user with username does exist, return an error
      if (existingUsername) {
        return res.status(422).send({ error: 'Username is in use' });
      }

      // If a user with email does NOT exist, create and save user record
      const user = new User({
        username: username,
        email: email,
        password: password
      });
  
      user.save(function(err) {
        if (err) { return next(err); }
  
        // Respond to request indicating the user was created
        res.json({ token: tokenForUser(user) });
      });
    });
  });
}
 