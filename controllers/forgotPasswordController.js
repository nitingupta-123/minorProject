const User = require("../models/User");
const jwt = require('jsonwebtoken');
const mailgun = require('mailgun-js')
const _ = require('lodash');
const DOMAIN = 'sandboxa0f8ddf7fbe1472cabc8cb672e6da42b.mailgun.org';
const { requireAuth } = require('../middleware/authMiddleware');
const mg = mailgun({ apiKey: '231be91ed490dad73470b21edfa2b905-ba042922-84038084', domain: DOMAIN });
const { sendMail, handleErrors, createToken } = require('./helper');


module.exports.forgotPassword_get = (req, res) => {
    res.render('forgotPassword');
}


module.exports.forgotPassword_put = (req, res) => {
    const { email } = req.body;
    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'User with this email does not exist ' });
        }
        const token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '20m' })
        const subject = 'Password Reset Link';
        const url = process.env.CLIENT_URL+':'+process.env.PORT  + '/reset-password';
        //const data = emailMessageBuilder(email, subject, url, token);

        return user.updateOne({ resetLink: token }, (err, token_data) => {

            if (err) { return res.status(400).json({ error: "reset password link error" }); }

            else {
                sendMail(email, subject, url,token, (err, data) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ message: 'INTERNAL SERVER ERROR' });
                    } else {
                        console.log(data);
                        return res.json({ message: 'Email sent!!' });
                    }
                });
            }
        });
    });
}


module.exports.resetPassword_get = (req, res) => {
    const resetLink = req.params.id;

    console.log('tokkrn', resetLink);
    res.render('resetPassword', { token: resetLink });
}


module.exports.resetPassword_put = (req, res) => {

    const newPass = req.body.password;
    const resetLink = req.params.id;
    console.log('resetLink newPass', newPass, resetLink);
    if (resetLink) {
        jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function (error, decodedData) {
            if (error) {
                return res.status(401).json({ error: "Incorrect token or it is expired." })
            }
            User.findOne({ resetLink }, (err, user) => {
                if (err || !user) {
                    return res.status(400).json({ error: "User with this token does not exist or this link is used." });
                }
                const obj = {
                    password: newPass,
                    resetLink: ''
                }

                user = _.extend(user, obj);
                user.save((err, result) => {
                    if (err) {
                        const errors = handleErrors(err);
                        return res.status(400).json({ errors });
                        //return res.status(400).json({ error: "reset password error" });
                    } else {
                        return res.json({ message: 'your password has been changed' })
                    }
                });

            })
        })
    }
}

