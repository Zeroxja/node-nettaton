const Authentication = require('./controllers/authentication');
const Game = require('./controllers/game');
const passportService = require('./services/passport');
const passport = require('passport');

// by default passport tries to create a session using cookies so set this to false
const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

module.exports = function(app) {
  app.get('/', requireAuth, function(req, res) {
    res.send({ message: 'Nettaton score api' });
  });
  // Using middlewear requireSignin
  app.post('/signin', requireSignin, Authentication.signin);
  // Create a new user
  app.post('/signup', Authentication.signup);
  // Get a list of highscores
  app.get('/score', Game.getAllScores);
  // Get a users scores
  app.get('/score/highscore', Game.highscore);
  // Get all the past game scores for a username
  app.get('/score/:username', requireAuth, Game.getScore);
  // Save the game score
  app.post('/score', requireAuth, Game.saveScore);
  
}
