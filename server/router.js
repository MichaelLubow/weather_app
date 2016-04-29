"use strict";

var express = require('express');
var router = express.Router();
var path = require('path');
var passport = require('passport');

var privateResourceRoot = express.static(path.join(__dirname, "../client"));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()){
    console.log("Authenticated");
    return next();
  }
  else{
    console.log('Not authenticated');
    res.redirect('/login');
  }
}

/**
 * A route to fetch the private static assets. It runs the request through authentication first and if the user is logged in, will
 * serve the private asset.
 */
router.get('/client/*/:file', /*ensureAuthenticated,*/ function(req, res, next){
  console.log('Private Static Assets');
  req.url = req.url.replace(/^\/client/, '');
  privateResourceRoot(req, res, next);
});


/**
 * Any route changes after the # will not affect the Express routing below. They will be handled by the front end framework's routing.
 * For example:
 *  localhost:8080/index.html will route via Express to match the /index.html
 *  localhost:8080/index.html/#candidates will route via Front End Framework to match the #candidates
 */

router.route('/login')
  .get(function(req, res, next) {
    console.log("I am inside the get of /login route");
    res.render('login');
  })
  .post(passport.authenticate('login', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    }
  ));

router.route('/register')
  .get(function(req, res, next) {
    console.log("I am inside the get of /register route");
    res.render('register');
  })
  .post(passport.authenticate('register', {
      successRedirect: '/login',
      failureRedirect: '/register',
      failureFlash: true
    }
  ));

router.get('/logout', function(req, res) {
  console.log("Inside the logout route");
  req.logout();
  res.render('login');
});

router.get('/noJS', function(req, res){
  console.log('User has Javascript disabled');
  res.render('no_js');
});

/**
 Handles the routes for whitespace, just a forward slash, or forward slash followed by a 'slug' one or more times
 For example: localhost:8080
 localhost:8080/
 localhost:8080/index.html
 localhost:8080/sample
 localhost:8080/sample/sample
 */

router.get('/', /*ensureAuthenticated,*/ function(req, res) {
  //res.render('no_js');
  res.render('index');
});

router.get(/(\s*)|(\/)|((\/.*)+)/, /*ensureAuthenticated,*/ function(req, res){
  res.redirect('/');
});

module.exports = router;