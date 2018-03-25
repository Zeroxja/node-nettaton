const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

// Define our model
const userSchema = new Schema({
  username: { type: String, unique: true, lowercase: true },
  email: { type: String, unique: true, lowercase: true },
  password: String,
  scores: [{
    type: Schema.Types.ObjectId,
    ref: 'score'
  }],
  correct: { type: Number, default: 0}
});

// On Save Hook, encrypt password
// Before saving a moel, run this function
userSchema.pre('save', function(next) {
  // get access to the user model
  const user = this; // user.email, user.password
  // check if the password has already been hashed
  if (!(bcrypt.getRounds(user.password) > 0)) {
    // generate a salt then run callback
    bcrypt.genSalt(10, function(err, salt) {
      if (err) { return next(err); }

      // hash (encrypt) out password using the salt
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        if (err) { return next(err); }

        // overwrite plain text password with encrypted password
        user.password = hash;
        // continue with saving the model
        
      });
    });
  }
  next();
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  // this.password is salt and hashed password
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return callback(err) }

    callback(null, isMatch);
  });
};

// Create the model class
const User = mongoose.model('user', userSchema);

// Export the model
module.exports = User;
