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
    Favorites.find({user: req.user._id})
    .populate('user', 'name')
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

favoriteRouter.route('/:tweetId')
.get(authenticate.verifyUser, (req, res ,next) => {
    res.statusCode = 403;
    res.end('GET operation is not supported on /favorites/'+req.params.tweetId);
})
.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user_id})
    .then((favorite) => {
        if(favorite) {
            var favoriteIndex = favorite.tweets.indexOf(req.params.tweetId);
            console.log(favoriteIndex)
            if(favoriteIndex === -1) {
                favorite.tweets.push(req.params.tweetId)
                favorite.save()
                .then((favorite) => {
                    console.log('Favorite created', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err)).catch((err) => next(err));
            } else {
                console.log('Favorite already exist');
                res.statusCode = 303;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite)
            }
        } else {
            Favorites.create({tweets: [req.params.tweetId]})
            .then((favorite) => {
                console.log('Favorite Created');
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err)).catch((err) => next(err))
        }
    }, (err) => next(err)).catch((err) => next(err))
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorites/'+ req.params.tweetId);
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        var favoriteIndex = favorite.tweets.indexOf(req.params.tweetId);
        if(favorite) {
            if(favoriteIndex < 0) {
                err = new Error('Tweet '+ req.params.tweetId+ ' not found');
                err.statusCode = 404;
                return next(err);
            } else {
                favorite.tweets.splice(favoriteIndex, 1);
                favorite.save()
                .then((favorite) => {
                    console.log('Favorite deleted');
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err)).catch((err) => next(err))
            } 

        } else {
            err = new Error('Favorites not found');
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err)).catch((err) => next(err));
});

module.exports = favoriteRouter;