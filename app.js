const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const  { requireAuth ,checkUser} = require('./middleware/authMiddleware');
const port =process.env.PORT||8000;
const app = express();

// middleware   https://authentication-system-nitin.herokuapp.com
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// database connection

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(port))
  .catch((err) => console.log(err));

// routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/about', (req, res) => res.render('about'));
app.get('/prediction', requireAuth,(req, res) => res.render('prediction'));
app.use(authRoutes);
