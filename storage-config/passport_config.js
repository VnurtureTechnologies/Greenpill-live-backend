const LocalStrategy = require("passport-local").Strategy
const bcrypt =require('bcrypt')
const admin = require('firebase-admin');
const opts = {};

module.exports = passport => {
 
    passport.use(
      new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
      },
        async (email, password, done) => {
        var db = admin.firestore();
        await db.collection('admin').where('email', '==', email)
        .get()
        .then((result) => {
          result.forEach(async (userData) => {
            if (userData.data().email == email) {
                const validPassword =await bcrypt.compare(password, userData.data().password);
                if (validPassword) {
                return done(null, userData.data().email)
              }else{
              return done(null, false, {
                message: "Invalid Password"
              })}
            }
            return done(null, false, {
              message: "user not found"
            })
            
          })
        })
        .catch((err) => console.log(err));
      })
    );
  };