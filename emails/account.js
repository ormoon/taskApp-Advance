const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const auth = {
    auth: {
        api_key: 'key-03bb7dd2a75ee4b508c959d2b9daf642', //this need to put in environment file but using mailgun it seems difficult
        domain: 'sandboxcc5953f763114aeba0d083c942575515.mailgun.org'
    }
}

const transporter = nodemailer.createTransport(mg(auth));

const sendMail = (email, subject, name, phone, text) => {
    transporter.sendMail({
        from: email,
        to: 'ormoon.gautam9821@gmail.com', // An array if you have multiple recipients.
        subject: subject,
        name: name,
        phone: phone,
        text: text,
    });
}


const sendCancelationMail = (email, name) => {
    transporter.sendMail({
        from: 'ormoon.gautam9821@gmail.com',
        to: email,
        subject: 'Sorry to see you go!',
        name: name,
        text: `Goodbye! ${name}. Hope to see you back again`
    });
}

module.exports = { sendMail, sendCancelationMail }
