const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Public = require('../models/Public.model')

passport.use('google', new GoogleStrategy({
    clientID: "896510479133-fma76gp7g35cg4ei79sieeok9ueppsat.apps.googleusercontent.com",
    clientSecret: "asFbK3Ew4WxENOADRVsdh-C9",
    callbackURL: "http://localhost:5000/blog/public/create"
  },
  function(accessToken, refreshToken, profile, done) {
    Public.find({ googleId: profile.id },(err, user) => {
    
      if(err){
        return done(err);
      }
  
      else if(user){
        return done(null, user)
      }
  
      else{
        var new_pub = Public()
  
        new_pub.googleId = profile.emails[0].value
        new_pub.token = accessToken
        new_pub.save((err) => {
          if(err)
            throw err;
          return done(null,new_pub)
        })
      }
  
    });
  }
));

passport.use('google-alt', new GoogleStrategy({
  clientID: "896510479133-fma76gp7g35cg4ei79sieeok9ueppsat.apps.googleusercontent.com",
  clientSecret: "asFbK3Ew4WxENOADRVsdh-C9",
  callbackURL: "http://localhost:5000/projects/auth/google/callback"
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