var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    name: {
        type: String,
        default: '',
        require: true
    },
    email:{
        type: String,
        default: ''
    },
    profilePicture:{
        type: String,
        default: ''
    },
    bio:{
        type: String,
        default: ''
    },
    location:{
        type: String,
        default: ''
    },
    website:{
        type: String,
        default: ''
    },
    following:[
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
],
    followers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
    }
],
    tweets: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tweet' 
        }
    ],
    likedTweets: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tweet'
        }
    ],
    admin:{
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose);
var UserSchema = mongoose.model('User', User);

User.pre('deleteOne', function (next) {
    const personId = this.getQuery()["_id"];
    mongoose.model("User").deleteOne({'following': {_id: personId}}, function (err, result) {
      if (err) {
        console.log(`[error] ${err}`);
        next(err);
      } else {
        console.log('success');
        next();
      }
    });
  });


module.exports = UserSchema;