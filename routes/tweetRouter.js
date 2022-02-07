const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Tweet = require('../models/tweet')

const tweetRouter = express.Router();

tweetRouter.use(bodyParser.json());

tweetRouter.route('/')
.get((req, res, next) => {
    Tweet.find({})
    .populate('user', 'name')
    .then((tweet) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(tweet);
    }, (err) => next(err)).catch((err) => next(err));
})
.post(authenticate.verifyUser, (req,res,next) => {
    Tweet.create({"user": req.user._id, "tweet": req.body.tweet})
    .then((tweet) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(tweet);
        console.log("tweet created")
    },(err) => next(err)).catch((err) => next(err));
})
.put(authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end("PUT operation is not  supported on /tweets")
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Tweet.remove({})
    .then((result) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(result)
    }, (err) => next(err)).catch((err) => next(err));
});

module.exports = tweetRouter;