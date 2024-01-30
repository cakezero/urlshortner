const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./authSchema')

const urlSchema = new Schema({
    longUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
})

const Url = mongoose.model('Urls', urlSchema);

module.exports = Url;