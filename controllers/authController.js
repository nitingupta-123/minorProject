const User = require("../models/User");
const jwt = require('jsonwebtoken');
const mailgun = require('mailgun-js')
const _ = require('lodash');
const DOMAIN = 'sandboxa0f8ddf7fbe1472cabc8cb672e6da42b.mailgun.org';
const { requireAuth } = require('../middleware/authMiddleware');
const mg = mailgun({ apiKey: '231be91ed490dad73470b21edfa2b905-ba042922-84038084', domain: DOMAIN });
const { emailMessageBuilder, handleErrors ,createToken} = require('./helper');
const maxAge = 3 * 24 * 60 * 60;


// controller actions


module.exports.login_get = (req, res) => {
  res.render('login');
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}



module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge:1 });
  res.redirect('/');
}

