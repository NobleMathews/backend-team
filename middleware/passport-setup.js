const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Public = require('../models/Public.model')

passport.use('google', new GoogleStrategy({
    clientID: "896510479133-fma76gp7g35cg4ei79sieeok9ueppsat.apps.googleusercontent.com",
    clientSecret: "asFbK3Ew4WxENOADRVsdh-C9",
    // use below one URL for development testing 
    // callbackURL: "http://localhost:5000/blog/auth/google/callback",
    callbackURL: "https://ancient-spire-21996.herokuapp.com/blog/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    
    try{
      const user = await Public.findOne({googleId: profile.emails[0].value})

      if(!user){

        try{
          const user = new Public({ googleId: profile.emails[0].value, token: accessToken})
          await user.save()
          return done(null,user)
        }catch(err){
          throw err
        }
        
      }else{
        return done(null,user)
      }
      

    }catch(err){
      return done(err)
    }
    
  }
));

passport.use('google-alt', new GoogleStrategy({
  clientID: "896510479133-fma76gp7g35cg4ei79sieeok9ueppsat.apps.googleusercontent.com",
  clientSecret: "asFbK3Ew4WxENOADRVsdh-C9",
  // callbackURL: "http://localhost:5000/projects/auth/google/callback",
  callbackURL: "https://ancient-spire-21996.herokuapp.com/projects/auth/google/callback"
},
  async function(accessToken, refreshToken, profile, done) {
    
    try{
      const user = await Public.findOne({googleId: profile.emails[0].value})

      if(!user){

        try{
          const user = new Public({ googleId: profile.emails[0].value, token: accessToken})
          await user.save()
          return done(null,user)
        }catch(err){
          throw err
        }
        
      }else{
        return done(null,user)
      }
      

    }catch(err){
      return done(err)
    }
    
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
}); 