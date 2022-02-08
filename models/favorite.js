const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'   
       },
       tweets: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tweet'
        }
       ]
}, {timestamps: true});

var Favorites = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorites;