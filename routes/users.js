var express = require('express');
var router = express.Router();

const bodyParser = require('body-parser');
var User = require('../models/user');

var passport = require('passport');
var authenticate = require('../authenticate');

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

router.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}),
  req.body.password, (err, res) => {
    if(err) {
      res.statusCode = 200;
      res.setHeader = ('Content-Type', 'application/json');
      res.json({err: err});
    }else{
      if(req.body.name){
        user.name = req.body.name;
      }
      if(req.body.email){
        user.email = req.body.email
      }     
      user.save((err, user) => {
        if(err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return ;
        }
      });
    }
  });
});

router.post('/login', passport.authenticate('local') ,(req, res) => {

})


module.exports = router;
