const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const auth = {
    auth: {
        api_key: process.env.API_KEY
        domain: process.env.Domain
    }
}

const transporter = nodemailer.createTransport(mg(auth));

const sendMail = (email, subject, name, phone, text) => {
    transporter.sendMail({
        from: email,
        to: 'xxx.xxxx.com', // An array if you have multiple recipients.
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
