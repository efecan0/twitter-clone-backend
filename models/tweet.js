var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var replySchema = require('./reply')
var favoriteSchema = require('./favorite');

var tweetSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    body: {
        type: String,
        require: true
    },
    attachment:[],
    originalTweet:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet'
    },   
    retweets:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tweet'
        }
    ],
    replies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tweet'
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
},{timestamps: true})


module.exports = mongoose.model('Tweet', tweetSchema);