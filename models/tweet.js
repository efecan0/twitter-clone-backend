var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var replySchema = require('./reply')
var favoriteSchema = require('./favorite');

var tweetSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tweet: {
        type: String,
        require: true
    },
    replies: [replySchema],
    favorites: [favoriteSchema]
},{timestamps: true})


module.exports = mongoose.model('Tweet', tweetSchema);