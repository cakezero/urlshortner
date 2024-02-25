const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')

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
}, {timestamps: true});

userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSaltSync(14);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.pre('remove', async function(next) {
    await this.model('Urls').deleteMany({ user: this._id });
    next();
});


const User = mongoose.model('users', userSchema);

module.exports = User;
