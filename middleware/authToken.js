require('dotenv').config();
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
                res.locals.user = user.username;
                next();
            }
        })
    } else {
        res.locals.user = null;
        next();
    }
};

module.exports = { 
    checkUser
};