var express = require('express');
var router = express.Router();

const bodyParser = require('body-parser');
var User = require('../models/user');

var passport = require('passport');
var authenticate = require('../authenticate');
const { findById } = require('../models/user');

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

router.route('/me')
.get(authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id)
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(user);
  },(err) => next(err)).catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation is not supported on /users/me')
})
.put( authenticate.verifyUser, (req, res, next) => {
  User.findOne({_id: req.user._id})
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
})
.delete(authenticate.verifyUser, async (req, res, next) => {
  try {
    const deleted = await User.deleteOne({_id: req.user._id});
    res.send('Success')
  } catch(e) {
    console.error(`[error] ${e}`);
    throw Error('Error occurred while deleting Person');
  }
 
})

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

router.route('/:userId/Follow')
.get(authenticate.verifyUser, (req, res, next) => { 
  res.statusCode = 403;
  res.end('GET operation is not supported on /users/'+req.params.userId+'/Follow');
})
.post(authenticate.verifyUser, async (req, res, next) => {
  try{
    var follower = await User.findById(req.user._id);
    var followed = await User.findById(req.params.userId);
    
    follower.following.push(followed);
    followed.followers.push(follower);
    
    await follower.save()
    await followed.save()

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(follower);
    return next();

  } catch {
         err = new Error('something problem');
         err.status = 404;
         return next(err) 
  }
})
.put(authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation is not supported on /users/'+req.params.userId+'/Follow');
})
.delete(authenticate.verifyUser, async (req, res, next) => {
  try{
    const follower = await User.findById(req.user._id);
    const followed = await User.findById(req.params.userId);

  for(var i = 0 ; i < follower.following.length; i++){
    if(follower.following[i] === followed){
      follower.following.splice(i, 1);

      for(var j = 0; j < followed.followers.length; j++){

        if(followed.followers[i] === follower){
          followed.followers.splice(j, 1);
          await follower.save()
          await followed.save()
          res.statusCode = 200;
          res.end('Success');
          return next();
        }
      }

    }
  }

  } catch {
    var err = new Error('Something got problem here');
    err.status = 400;
    return next(err);
  }

})

module.exports = router;
