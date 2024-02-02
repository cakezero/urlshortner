const jwt = require('jsonwebtoken');
const User = require('../models/authSchema');

const checkUser = (req, res, next) => {
    const token = req.cookies.url_cookie;
    if (token) {
        jwt.verify(token, process.env.SECRET_MESSAGE, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                console.log(err)
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        })
    } else {
        res.locals.user = null;
        next();
    }
}

const requireAuth = (req, res, next) => {
    const token = req.cookies.url_cookie;

    if (!token) {
        return res.redirect('/user/login')
    }

    jwt.verify(token, process.env.SECRET_MESSAGE, (err, decodedToken) => {
        if (err) {
            res.redirect('/user/login');
        } else {
            next();
        }
    })
}

module.exports = { 
    checkUser,
    requireAuth
};