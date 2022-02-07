var express = require('express');
var router = express.Router();

const bodyParser = require('body-parser');
var User = require('../models/user');

var passport = require('passport');
var authenticate = require('../authenticate');
const user = require('../models/user');

router.use(bodyParser.json());

/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin ,(req, res, next) => {
  User.find({})
  .then((users) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.put('/me', authenticate.verifyUser, (req, res, next) => {
  User.findOne({user: req.user._id})
  .then((User) => {
    if(User){

      if(req.body.email){
        User.email = req.body.email
      }
      if(req.body.profilePicture){
        User.profilePicture = req.body.profilePicture;
      }
      if(req.body.bio){
        User.bio = req.body.bio;
      }
      if(req.body.location){
        User.location = req.body.location;
      }
      if(req.body.name){
        User.name = req.body.name;
      }
      if(req.body.website) {
        User.website = req.body.website
      }

      User.save()
      .then((User) => {
        console.log('Updates has changed correcty');
        res.statusCode = 200; 
        res.setHeader("Content-Type", "application/json");
        res.json(User);
      }, (err) => next(err)).catch((err) => next(err));
    }else{
      err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }
  }).catch((err) => next(err))
});

router.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if (req.body.name)
        user.name = req.body.name;
      if (req.body.email)
        user.email = req.body.email;
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return ;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        });
      });
    }
  });
});
router.post('/login', passport.authenticate('local') ,(req, res) => {
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});


module.exports = router;
