const User = require("../models/User");
const jwt = require('jsonwebtoken');
const nodeMailer=require('nodemailer')
//require('dotenv').config();
// const _ = require('lodash');
// const mailgun = require('mailgun-js')
// const DOMAIN = 'sandboxa0f8ddf7fbe1472cabc8cb672e6da42b.mailgun.org';
// const mg = mailgun({ apiKey: '231be91ed490dad73470b21edfa2b905-ba042922-84038084', domain: DOMAIN });


// handle errors
module.exports.handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    // duplicate email error
    if (err.code === 11000) {
        errors.email = 'This email is already registered!!';
        return errors;
    }

    if (err.code === -3008) {
        errors.email = 'Seems you are offline!!';
        return errors;
    }



    if (err.message === 'incorrect password') {
        errors.password = 'incorrect password';
        return errors;
    }

    if (err.message === 'incorrect email') {
        errors.email = 'this email is not registered';
        return errors;
    }

    // validation errors
    if (err.message.includes('user validation failed')) {

        Object.values(err.errors).forEach(({ properties }) => {

            errors[properties.path] = properties.message;

        });
    }

    return errors;
}

//message builder for email

const emailMessageBuilder = (email, subject, url, token) => {
    const data = {
        from: 'noreply@hello.com',
        to: email,
        subject: subject,
        html: 
            `
                <h2>Please click on the given link to verify your email</h2>
                <p>${url}/${token}</p>
            `
    };
    return data;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
module.exports.createToken = (id) => {
  return jwt.sign({ id }, 'ThisIsNitinGuptaKaSecret', {expiresIn: maxAge});
};


const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth:{
        user:'nitingupta31122001@gmail.com',
        pass:'Gm@!l@123'
    }
});


module.exports.sendMail=(email,subject,url,token,callback)=>{
    //console.log('token----',token);
    const mailOption=emailMessageBuilder(email, subject, url, token);
    transporter.sendMail(mailOption,(err,data)=>{
        if(err)
        {
           return callback(err,null);
        }
        else{
            return callback(null,data);
        }
    });
}


