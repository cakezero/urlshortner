const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')
const Urls = require('./urlSchema')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be empty'],
        unique: true,
        lowercase: true,
        minlength: [4, 'Username should be atleast 4 characters']
    },
    email: {
        type: String,
        required: [true, 'Email cannot be empty'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be empty'],
        minlength: [8, 'Minimum password length should be 8 characters']
    },
    urls: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Urls'
    }]
});

userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSaltSync(14);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) { 
            return user;
        }
        throw Error('Incorrect email or password');
    }
    throw Error('Incorrect email or password');
}

const User = mongoose.model('Users', userSchema);

module.exports = User;
