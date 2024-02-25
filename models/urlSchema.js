const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true})

const Url = mongoose.model('urls', urlSchema);

module.exports = Url;
