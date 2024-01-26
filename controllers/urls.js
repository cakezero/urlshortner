require('dotenv').config();
const Url = require('../models/urlSchema');
const User = require('../models/authSchema');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const home = async (req, res) => {
    const token = req.cookies.url_cookie;
    if (token) {
        jwt.verify(token, process.env.SECRET_MESSAGE, async (err, decodedToken) => {
            if (err) {
                console.log(err);
                res.redirect('/user/login');
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                const url = await Url.findOne({ user }).sort({ '_id': -1 })
                if (url) {
                    return res.render('home', { url })
                }
                next();
            }
        })
    }
    return res.render('home');
}

const shortLink = async (req, res) => {
    const shortUrl = req.params.shortUrl;
    await Url.findOne({ shortUrl })
        .then((result) => res.redirect(`${ result.longUrl }`))
        .catch((error) => res.sendStatus(404))
}

const short = async (req, res) => {
    const token = req.cookies.url_cookie;
    let { url } = req.body;
    if (validator.isURL(url)) {
        const urlParts = url.split('://');
        const protocol = ['https', 'http', 'ftp'];
        for (i = 0; i < protocol.length; i++) {
            if (urlParts[0] == protocol[i]) {
                const urlBody = urlParts[1];
                let shortUrl = '';
                for (i = 0; i < 8; i++) {
                    let u = Math.floor(Math.random() * urlBody.length);
                    if (i % 2 == 0) {
                        shortUrl += urlBody[u].toUpperCase();
                    } else {
                        shortUrl += urlBody[u];
                    }
                }
                if (token) {
                    jwt.verify(token, process.env.SECRET_MESSAGE, async (err, decodedToken, next) => {
                        if (err) {
                            res.redirect('/');
                            next();
                        } else {
                            const user = await User.findById(decodedToken.id)
                            if (user) {
                                user.urls.push(shortUrl);
                                user.save();
                                await Url.create({ longUrl: url, shortUrl, user });
                                res.status(201).json({ message: 'Url Shortened Successfuly!!' });
                                next();
                            }
                        }
                    })
                }
                return res.status(201).json({ notSigned: {
                    shortUrl,
                    longUrl: url
                }
            });
            }
        }
        return res.status(200).json({ error: 'Enter protocotol with url' });
    } 
    return res.status(200).json({ error: 'Invalid Url passed'});
}

module.exports = {
    home,
    shortLink,
    short
}