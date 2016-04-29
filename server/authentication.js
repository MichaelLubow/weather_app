"use strict";

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var demoUser = require('./demoUser');


passport.use('login', new LocalStrategy({
    passReqToCallback: true // allows us to pass back the entire request to the callback
},
function(req, username, password, done) {
        if(demoUser.user.username !== username){
            return done(null, false, req.flash('message', 'User Not found.'));
        }
        // User exists but wrong password, log the error
        if (!demoUser.isValidPassword(demoUser.user, password)) {
            console.log('Invalid Password');
            return done(null, false,
                req.flash('message', 'Invalid Password'));
        }
        // User and password both match, return user from
        // done method which will be treated like success
        console.log("about to return done");
        return done(null, demoUser.user);

        /*Reenable this when implementing database connectivity*/

        //User.findOne({ username: username }, function (err, user) {
        //    if (err) {
        //        return done(err);
        //    }
        //    if (!user) {
        //        return done(null, false, { message: 'Incorrect username.' });
        //    }
        //    if (!user.validPassword(password)) {
        //        return done(null, false, { message: 'Incorrect password.' });
        //    }
        //    return done(null, user);
        //});
    }
));

passport.use('register', new LocalStrategy({
    passReqToCallback: true // allows us to pass back the entire request to the callback
},
    function(req, username, password, done) {

        var err = "Cannot create a user without being connected to the DB";
        console.error(err);
        return done(null, false, req.flash('message', err));

        /*Reenable this when implementing database connectivity*/

        //User.findOne({ username: username }, function (err, user) {
        //    if (err) {
        //        return done(err);
        //    }
        //    if (!user) {
        //        return done(null, false, { message: 'Incorrect username.' });
        //    }
        //    if (!user.validPassword(password)) {
        //        return done(null, false, { message: 'Incorrect password.' });
        //    }
        //    return done(null, user);
        //});
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null, demoUser.user.id);

    /*Reenable this when implementing database connectivity*/
    //User.findById(id, function(err, user) {
    //    done(err, user);
    //});
});