require('dotenv').config();
const express = require('express');
const randomstring = require('randomstring');
const mongoose = require('mongoose');
const Url = require('./models/model');
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/shortener';

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }))

mongoose.connect(DB_URL)
    .then(() => console.log('Connected to the DB'))
    .then(() => app.listen(PORT), console.log(`Connected to ${PORT}`))
    .catch((error) => console.log({ "Error": error }))

app.get('/', async (req, res) => {
    await Url.find()
        .then((urls) => res.render('home', { urls }))
        .catch((error) => res.sendStatus(404))
})

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = req.params.shortUrl;
    await Url.findOne({ shortUrl })
        .then((result) => res.redirect(`${ result.longUrl }`))
        .catch((error) => res.sendStatus(404))
})

app.post('/short', async (req, res) => {
    const { url } = req.body;
    const shortUrl = randomstring.generate(8);
    const newUrl = await new Url({
        longUrl: url,
        shortUrl: shortUrl
    })
    newUrl.save()
      .then(() => res.redirect('/'))
      .catch((error) => console.log({ "Error": error }))
})