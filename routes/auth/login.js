const express = require('express');
const route = express.Router();
const passport = require('passport');
const {checkNotAuthenticated} = require('../../security_functions/authenFunc');

route.get('/', checkNotAuthenticated, (req, res) => {
    
    res.render('auth/login.ejs');  
  })

  
route.post(
    '/', 
    passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
    
}));

module.exports = route;
