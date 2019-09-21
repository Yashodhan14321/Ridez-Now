const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
//Bring in models
let User = require('../models/user');

//Register form
router.get('/signup', function(req,res){
  res.render('register');
});

//register process
router.post('/signup', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const phone = req.body.phone;
  const password = req.body.password;
  const cpassword = req.body.cpassword;

  req.checkBody('name','Name is required').notEmpty();
  req.checkBody('email','Email is required').notEmpty();
  req.checkBody('email','Name is not valid').isEmail();
  req.checkBody('username','Username is required').notEmpty();
  req.checkBody('phone','PhoneNumber is required').notEmpty();
  req.checkBody('password','Password is required').notEmpty();
  req.checkBody('cpassword','Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register',{
      errors:errors
    });
  }
  else {
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      phone:phone,
      password:password
    });

  bcrypt.genSalt(10, function(err, salt){
    bcrypt.hash(newUser.password, salt, function(err, hash){
      if(err){
        console.log(err);
      }
      newUser.password = hash;
      newUser.save(function(err){
        if(err){
          console.log(err);
          return;
        }
        else {
          req.flash('success', 'You are now registered and can log in');
          res.redirect('/users/login');
        }
      });
    });
  });
  }
});

//login form
router.get('/login', function(req,res){
  res.render('login');
});

//login process
router.post('/login', function(req, res, next){
    passport.authenticate('local',{
      successRedirect:'/',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
});

//Logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
})

module.exports = router;
