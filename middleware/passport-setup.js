const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Public = require('../models/Public.model')

passport.use('google', new GoogleStrategy({
    clientID: "896510479133-fma76gp7g35cg4ei79sieeok9ueppsat.apps.googleusercontent.com",
    clientSecret: "asFbK3Ew4WxENOADRVsdh-C9",
    callbackURL: "http://localhost:5000/blog/public/create"
  },
  function(accessToken, refreshToken, profile, done) {
    Public.find({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

passport.use('google-alt', new GoogleStrategy({
  clientID: "896510479133-fma76gp7g35cg4ei79sieeok9ueppsat.apps.googleusercontent.com",
  clientSecret: "asFbK3Ew4WxENOADRVsdh-C9",
  callbackURL: "http://localhost:5000/projects/public/create"
},
function(accessToken, refreshToken, profile, done) {
  Public.find({ googleId: profile.id }, function (err, user) {
    return done(err, user);
  });
}
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
}); 