const jwt = require('jsonwebtoken');
const User = require('../models/authSchema');

const checkForUser = (token) => {
    return jwt.verify(token, process.env.SECRET_MESSAGE, async (err, decodedToken) => {
        if (err) {
            throw new Error('Error')
        }
        const user = await User.findById(decodedToken.id)
        if (!user) {
            throw new Error('Something went wrong. Kindly logout and log back in!') 
        }
        return user;
    })
}

const checkUser = async (req, res, next) => {
    const token = req.cookies.url_cookie;

    try {

        const user = await checkForUser(token);
        res.locals.user = user;
        next();

    } catch (err) {
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
    requireAuth,
    checkForUser
};