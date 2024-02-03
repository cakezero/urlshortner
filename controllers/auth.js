const User = require('../models/authSchema');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcrypt')


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

    if (!validator.isEmail(email)) {
        return  res.status(400).json({ error: 'Email is invalid' })
    }

    try {

        const userr = await User.findOne({ email });
        const uname = await User.findOne({ username })

        if (userr) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        if (uname) {
            return res.status(400).json({ error: 'Username already exists' })
        }

        const user = await User.create({ username, email, password, urls: [] });
        const token = createToken(user._id);
        res.cookie('url_cookie', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ message: 'User Created Successfully' });

    } catch (err) {  
        res.status(500).json({ error: 'User Registeration Failed' });
    }
};


// Login
const login = (req, res) => {
    res.render('login')
};

const login_post = async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'Email does not exist' })
        }
        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) {
            return res.json({ error: 'Email or Password is incorrect' })
        }

        const token = createToken(user._id);
        res.cookie('url_cookie', token, { httpOnly: true, maxAge: maxAge * 1000 });
        return res.status(200).json({ message: 'User logged in successfully' });

    } catch(err) {
        return res.status(500).json({ error: 'User login failed!!' })
    }
    
};

const profile = (req, res) => {
    res.render('profile')
}


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
    profile,
    logout
}