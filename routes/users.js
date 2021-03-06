const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const usermodel=require('../models/userdata');
var mail;
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  mail=req.body.email;
  console.log(mail);
  passport.authenticate('local', {
    successRedirect: '/addform',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});



//mongoDB operations...

router.get('/add',function(req,res,next){
  res.render('addform');
})

router.post('/add',function(req,res,next){
  console.log(req.body);
  const userdata={
      user_email:mail,
      user_data:{user_name:req.body.user_name,
      user_mail:req.body.user_mail,
  user_mobile:req.body.user_mobile}
  }
  console.log(userdata);
      usermodel(userdata).save((err)=>{
          if(err){
              res.render('addform');
          }
          else{
              res.render('addform');
          }
  
      })
  });


  router.get('/display',(req,res,next)=>{
    console.log(mail);
    usermodel.find({user_email:mail},(err,users)=>{
        if(err){
            console.log(err);
        }else{
            console.log(users);
            res.render('displaytable',{users:users});
            //console.log(users);
        }
    })
})

router.get('/delete/:id',(req,res)=>{
  usermodel.deleteOne({"user_data._id":req.params.id},(err,project)=>{
      if(err){
          //req.flash('error_msg','Record not deleted');
          res.redirect('../display');
      }else{
          //req.flash('success_msg','record deleted');
          res.redirect('../display');
      }
  });
});

router.get('/edit/:id',(req,res)=>{
  // usermodel.findById(req.params.id,(err,user)=>{
  //         if(err){
  //             console.log(err);
  //         }else{
  //             console.log(user);
  //             res.render('edit-table',{users:user});
  //         }
  // });
  usermodel.findOne({"user_data._id":req.params.id},(err,users)=>{
      if(err){
          console.log(err);
      }else{
          // console.log(req.params.id);
          // console.log(users[0].user_data[0]._id);
              res.render('edittable',{users:users.user_data[0]});
      }
  })
});

router.post('/edit/:id',(req,res,next)=>{
  usermodel.updateMany({"user_data._id":req.params.id},{$set:{"user_data.$.user_name":req.body.user_name,"user_data.$.user_mail":req.body.user_mail,"user_data.$.user_mobile":req.body.user_mobile}},(err)=>{
      if(err){
          console.log(err);
          res.redirect('../edit/'+req.params.id);
      }else{
          res.redirect('../display');
      }
  });
});
router.get('/show/:id',(req,res)=>{
  usermodel.find({user_email:mail},(err,users)=>{
      if(err){
          console.log(err);
      }else{
          // console.log(req.params.id);
          // console.log(users[0].user_data[0]._id);
          users.forEach(user=>{if(user.user_data[0]._id==req.params.id){
              //console.log(user.user_data[0]);   
              res.render('show',{users:user.user_data[0]});
          }
          })
      }
  })

});


module.exports = router;
