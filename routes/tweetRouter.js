const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Tweet = require('../models/tweet');
const User = require('../models/user');

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
.post(authenticate.verifyUser, async (req,res,next) => {
   const tweet = await Tweet.create({"user": req.user._id, "body": req.body.body});
   tweet.originalTweet = tweet._id;
   tweet.save()
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
    .populate('user', 'name likedTweets')
    .populate('replies', 'user body originalTweet replies')
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
.delete(authenticate.verifyUser, async (req, res, next) =>{
    const deleteTweet = await Tweet.findOneAndRemove({_id: req.params.tweetId})
    const deleteReply = await Tweet.findOne({ _id: deleteTweet.originalTweet});
    for(var i = 0; i < deleteReply.replies.length; i++) {
        if(deleteReply.replies[i]._id.toString() === deleteTweet.id){
            deleteReply.replies.splice(i, 1);
            console.log("success")
        }
    }
    deleteReply.save()
    .then((reply) => {
        console.log('Tweet deleted, reply deleted');
        res.setHeader('Content-Type', 'application/json');
        res.json(reply)
    })
});

tweetRouter.route('/:tweetId/replies')
.get((req, res, next) => {
    Tweet.findById(req.params.tweetId)
    .populate('replies', 'body user')
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
.post(authenticate.verifyUser, async (req, res, next) => {
    const originalTweet = await Tweet.findById(req.params.tweetId)
    const reply = await Tweet.create({"user": req.user._id, "body": req.body.body, "originalTweet":originalTweet.originalTweet})
    

    originalTweet.replies.push(reply);
    originalTweet.save()
    .then((tweet) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(tweet)
    }, (err) => next(err)).catch((err) => next(err))
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation is not supported on /tweets/" +req.params.tweetId+"/replies")
})
.delete(authenticate.verifyUser, (req, res ,next) => {
   res.status= 403;
   res.end('DELETE operation is not supported on tweets/'+ req.params.tweetId+'/replies')
});

tweetRouter.route('/:tweetId/FavoriteTweet')
.get(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation is not supported on tweets/'+ req.params.tweetId +'/FavoriteTweet')
})
.post(authenticate.verifyUser, async (req, res, next) => {
 
    try{
        const tweet = await Tweet.findById(req.params.tweetId)
    const userLike = await User.findById(req.user._id);
 
         for(var i =0 ; i< tweet.likes.length; i++){
             if(tweet.likes[i]._id.toString() == req.user._id.toString()){
                 var err = new Error('You have already liked the tweet');
                 err.status = 404;
                 return next(err);
             }
         }
 
         userLike.likedTweets.push(tweet)
         tweet.likes.push(req.user);
         
         await tweet.save()
         await userLike.save()

         res.send('LIKED 🥳')   
    }catch{
        err = new Error('something problem');
        err.status = 404;
        return next(err)    }
  
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /'+ req.params.tweetId + '/FavoriteTweet')
})
.delete(authenticate.verifyUser, async (req, res, next) => {
    try{
        const tweet = await Tweet.findById(req.params.tweetId)
        const user = await User.findById(req.user._id) 
        console.log(user)   
        for(var i = 0; i<tweet.likes.length; i++) {
            if(tweet.likes[i]._id.toString() == req.user._id.toString()){
                for(var j = 0; j< user.likedTweets.length; j++){
                    if(user.likedTweets[j]._id.toString() == tweet._id.toString()){
                        user.likedTweets.splice(j, 1);
                        tweet.likes.splice(i, 1)
                        await tweet.save()    
                        await user.save()
                        res.statusCode = 200;
                        return res.send('DISLIKED 🥳'); 
                    }
                }       
            }
        }
    }catch {
        err = new Error('something problem');
        err.status = 404;
        return next(err) 
    }
})

module.exports = tweetRouter;