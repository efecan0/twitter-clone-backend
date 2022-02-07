var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var replySchema = new Schema({
    reply: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

var tweetSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tweet: {
        type: String,
        require: true
    },
    replies: [replySchema]
},{timestamps: true})


module.exports = mongoose.model('Tweet', tweetSchema);