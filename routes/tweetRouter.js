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
        console.log("tweet created")
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(tweet);
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

tweetRouter.route('/:tweetId')
.get((req, res, next) => {
    Tweet.findById(req.params.tweetId)
    .populate('user', 'name')
    .then((tweet) => {
        res.statusCode=200;
        res.setHeader('Content-Type', 'application/json');
        res.json(tweet)
    },(err) => next(err)).catch((err) => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation is not supported on /tweets/'+req.params.tweetId);
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /tweets/'+req.params.tweetId);
})
.delete(authenticate.verifyUser, (req, res, next) =>{
    Tweet.findOne({user: req.user._id})
    .then((tweet) => {
        var tweetIndex = tweet.id.indexOf(req.params.tweetId)
        console.log(tweet.tweet)
        console.log(tweetIndex)
        if(tweet) {
            if(tweetIndex < 0) {
                err = new Error('Tweet '+ req.params.tweetId + ' not found');
                err.statusCode = 404;
                return next(err);
            } else {
                tweet.tweet.splice(tweetIndex, 1);
                tweet.save()
                .then((tweet) => {
                    console.log('Tweet Deleted');
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(tweet);
                }, (err) => next(err));
            }

        } else {
            err = new Error('Tweet not found');
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err)).catch((err) => next(err))  
});

tweetRouter.route('/:tweetId/replies')
.get((req, res, next) => {
    Tweet.findById(req.params.tweetId)
    .then((tweet) => {
        if(tweet != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(tweet.replies);
        } else {
            err = new Error('Tweet '+req.params.tweetId + ' not found');
            err.status = 404;
            return next(err)
        }
    }, (err) => next(err)).catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Tweet.findById(req.params.tweetId)
    .then((tweet) => {
        req.body.user = req.user._id;
        tweet.replies.push(req.body);
        tweet.save()
        .then((tweet) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(tweet);
        }, (err) => next(err)).catch((err) => next(err));
    })
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation is not supported on /tweets/" +req.params.tweetId+"/replies")
})
.delete(authenticate.verifyUser, (req, res ,next) => {
    Tweet.findById(req.params.tweetId)
    .then((tweet) => {
        if(tweet != null) {
            console.log(tweet);
            for(var i = (tweet.replies.length-1) ; i>=0; i--) {
                tweet.replies.id(tweet.replies[i]._id).remove();
            }
            tweet.save()
            .then((tweet) => {
                res.statusCode = 200;
                res.setHeader("Content-Type" ,"application/json");
                res.json(tweet);
            }, (err) => next(err)).catch((err) => next(err));
        } else {
            err = new Error("Tweet "+req.params.tweetId + " not found");
            err.status = 404;
            return next(err);
        } 
    }, (err) => next(err)).catch((err) => next(err));
})
module.exports = tweetRouter;