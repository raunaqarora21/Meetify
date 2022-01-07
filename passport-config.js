const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const passportAuthenticator = (passport, user) => {
  passport.use(
    new localStrategy(
      { usernameField: "username", passwordField: "password" },
      (username, password, done) => {
        
        
        user.findOne({ username: username }, async(err, data) => {
          // console.log(data);
          if (err) return done(err);
          try{
          if (data) {
            // console.log(data.password);
            // console.log(password);
            // console.log(password.localeCompare(user.password));
            const passwordMatch = await bcrypt.compare(password, data.password);
            if (passwordMatch) return done(null, data);
            else return done(null, false, { message: "Password Incorrect" });
          } else return done(null, false, { message: "Username Not found" });
        }catch(err){
            console.log(err);
        }
        });
      }
    )
  );
  passport.serializeUser((data, done) => {
    return done(null, data.id);
  });
  passport.deserializeUser((id, done) => {
    user.findById(id, (err, data) => {
      return done(null, data);
    });
  });
};

module.exports = passportAuthenticator;