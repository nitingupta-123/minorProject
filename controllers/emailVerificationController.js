const User = require("../models/User");
const jwt = require('jsonwebtoken');
const { sendMail, handleErrors, createToken } = require('./helper');
const _ = require('lodash');
// const mailgun = require('mailgun-js')
// const DOMAIN = 'sandboxa0f8ddf7fbe1472cabc8cb672e6da42b.mailgun.org';
// const mg = mailgun({ apiKey: '231be91ed490dad73470b21edfa2b905-ba042922-84038084', domain: DOMAIN });


const maxAge = 3 * 24 * 60 * 60;

module.exports.verify_get = (req, res) => {
  res.render('verify');
}


module.exports.verify_post = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ error: 'User with this email already exist' });
    }
    const token = jwt.sign({ email }, process.env.JWT_ACC_ACTIVATE, { expiresIn: '20m' })
    const subject = 'Email Verification';
    const url = process.env.CLIENT_URL+':'+process.env.PORT +  '/verify-sucess';

    sendMail(email, subject, url, token, (err, data) => {
      if (err) {
        console.log('errror during sending email for email-verification', err);
        if(err.errno===-3008){
          return res.status(500).json({ message: 'Seems you are offline!!' });
        }
        return res.status(500).json({ message: 'INTERNAL ERROR!!' });
      } else {
        //console.log(data);
        return res.json({ message: 'Email sent!!' });
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: 'Something went wrong!' + error });
  }
}


module.exports.verifySucess_get = (req, res) => {
  const verificationLink = req.params.id;
  jwt.verify(verificationLink, process.env.JWT_ACC_ACTIVATE, async function (error, decodedData) {

    if (error) {
      return res.status(401).json({ error: "Incorrect token or it is expired." })
    }

    await User.findOne({ email: decodedData.email }, (err, user) => {
      if (user) {
        return res.status(401).json({ error: "User with this email already exist ." })
      }
      else if (err) {
        return res.status(401).json({ error: "Incorrect token or it is expired." })
      }
      else if (decodedData.email && !user) {
        res.render('signup', { email: decodedData.email });
      }

    });

  });
}

module.exports.verifySucess_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  }
  catch (err) {
    console.log('verify success error thrown ', err);
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
}