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
        const userr = await User.findOne({ email });
        console.log({userr});
        if (userr) {
            return res.status(200).json({ error: 'Email already exists' });
        }
        const user = await User.create({ username, email, password, urls: [] });
        const token = createToken(user._id);
        res.cookie('url_cookie', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ message: 'User Created Successfully' });
    } catch (err) {  
        res.status(400).json({ Error: 'User Registeration Failed' });
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
        console.log({users})
        if (users) {
            console.log({ user: 'i be user :D' })
            const token = createToken(users._id);
            res.cookie('url_cookie', token, { httpOnly: true, maxAge: maxAge * 1000 });
            return res.status(200).json({ message: 'User logged in successfully' });
        }
        console.log({ user: 'i no be user ooh :|' })
        return res.status(404).json({ error: 'User not found' })
    } catch(err) {
        return res.status(500).json({ error: 'User login failed!!' })
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