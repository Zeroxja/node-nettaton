const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// Create local strategy
const localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
  // Verify this email and password, call done with the user
  // If it is the correct username and password
  // Otherwise , call done with false
  User.findOne({ email: email }, function(err, user) {
    if (err) { return done(err); }
    // User not found
    if (!user) { return done(null, false); }
    console.log(password);
    // compare passwords - is `password` equal to user.password?
    user.comparePassword(password, function(err, isMatch) {
      if (err) { 
        return done(err); 
      }
      if (!isMatch) { 
        console.log(isMatch);
        return done(null, false); 
      }
      return done(null, user);
    });
  })
});

// Setup options for JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secret
};

// Create JWT strategy
// payload is the decoded jwt token, the user id and timestamp
// done is a callback function that we need to call depending on if the authentication is successfull
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  // See if the user ID in the payload exists in our database
  // If it does, call 'done' with that user
  // Otherwise, call done without a user object
  console.log(payload);
  User.findById(payload.sub, function(err, user) {
    // error finding a user e.g failed to connect to the database
    if (err) { 
      return done(err, false); 
    }

    if (user) {
      // no error and found a user
      done(null, user);
    } else {
      // no error searching for a user but couldn't fine a user
      done(null, false);
    }
  });
});

// Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);
