const express = require('express');
const route = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const {checkNotAuthenticated} = require('../../security_functions/authenFunc');
const user = require('../../db/schemas/user');



route.get('/', checkNotAuthenticated, (req, res) => {
    res.render('auth/signup.ejs');  
})

route.post('/', checkNotAuthenticated, (req, res) => {
    

    user.findOne ({username: req.body.username}, async(err, data) => {
        if(err){
            console.log(err);
        }
        if(data){
            req.flash('err', 'Username already exists');
            res.redirect('/register');
        }
        else{

            const password = req.body.password;
            const hash = await bcrypt.hash(password, 10);
            user({
                // id: Date.now().toString(),
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                // password: req.body.password,
                password:hash

                
            
            }).save(
                err => {
                    if(err){
                        console.log(err);
                    }
                    req.flash("success", "Signup Successful");
                    res.redirect("/login");
                    // res.redirect('/login');
                }
                
            )
        }
    })
})

module.exports = route;
    





