require('dotenv').config();
const User = require('../models/authSchema');
const jwt = require('jsonwebtoken')


//  MaxAge
const maxAge = 1 * 24 * 60 * 60
const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_MESSAGE, {
        expiresIn: maxAge
    });
}


// Register
const register = (req, res) => {
    res.render('register')
};

const register_post = async (req, res) => {
    const { username, email, password, password2 } = req.body;

    if (password !== password2) {
       return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        const user = await User.create({ username, email, password, urls: [] });
        const token = createToken(user._id);
        res.cookie('url_cookie', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
    } 
    catch (err) {  
        res.status(400).json({ error: 'User Registeration Failed' });
    }
};


// Login
const login = (req, res) => {
    res.render('login')
};

const login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const users = await User.login(email, password);
        const token = createToken(users._id);
        res.cookie('url_cookie', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: users._id });
    }
    catch (err) {
        res.status(400).json({ error: 'User Login Failed' })
    }
};


// Logout
const logout = (req, res) => {
    res.cookie('url_cookie', '', { maxAge: 1 });
    res.redirect('/');
}

module.exports = {
    register,
    register_post,
    login,
    login_post,
    logout
}