const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favorites = require('../models/favorite');
const Tweets = require('../models/tweet');
var authenticate = require('../authenticate');
const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('tweets')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type' ,'application/json');
        res.json(favorites);
    }, (err) => next(err)).catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation is not supported on /favorites');
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorites');
})
.delete(authenticate.verifyUser, (req, res, next) => {
     Favorites.findByIdAndRemove({'user': req.user._id})
     .then((favorites) => {
         res.statusCode = 200;
         res.setHeader('Content-Type', 'application/json');
         res.json(favorites);          
     }, (err) => next(err)).catch((err) => next(err));
});

module.exports = favoriteRouter;