require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { checkUser } = require('./middleware/authToken');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/shortener';

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser());

mongoose.connect(DB_URL)
    .then(() => console.log('Connected to the DB'))
    .then(() => app.listen(PORT), console.log(`Connected to ${PORT}`))
    .catch((error) => console.log({ "Error": error }))

app.use('*', checkUser);

app.use('/', userRoutes);

app.use('/user', authRoutes);