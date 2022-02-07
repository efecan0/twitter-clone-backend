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
    admin:{
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);