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

module.export = replySchema;