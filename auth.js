const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const passport = require('passport');
// const GitHubStrategy = require('passport-github').Strategy;
const { ObjectID } = require('mongodb');

module.exports = function (app, myUsers) {

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        myUsers.findOne({ _id: new ObjectID(id) }, (err, doc) => {
            done(null, doc);
        });
    });

    passport.use(new LocalStrategy((username, password, done) => {
        myUsers.findOne({ username: username }, (err, user) => {
            console.log(`User ${username} attempted to log in.`);
            if (err) {
                console.log(err)
                return done(err);
            }
            if (!user) { return done(null, false,{ message: 'Invalid Username'}); }
            if (!bcrypt.compareSync(password,user.password)) { return done(null, false , {message: 'Wrong Password'}); }
            return done(null, user);
        });
    }));
}