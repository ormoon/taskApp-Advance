require('./db/dbconnect');
const express = require('express');
const app = express();
const morgan = require('morgan');
var userRoute = require('./routes/userRoute');
var taskRoute = require('./routes/taskRoute');
const { sendMail } = require('./emails/account');


require('dotenv').config();
const port = process.env.PORT;
const hostname = process.env.HOST;


var path = require('path');
var hbs = require('hbs');
// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

//static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

//hbs
app.set('view engine', 'hbs');

app.get('', (req, res) => {
    res.render('index', {
        title: 'Email'
    })
})

app.post('/send', (req, res) => {
    console.log(req.body)
    const { email, subject, name, phone, text } = req.body;
    sendMail(email, subject, name, phone, text);
    res.render('index')
})



//middlewares
// app.use((req, res, next) => {
//     res.status(503).send("--------- The site is under maintenance, Please try back soon ----------");
// })
app.use('/user', userRoute);
app.use('/task', taskRoute);
app.use((err, req, res, next) => {
    res.status(400).send({ err: err.message })
})


app.listen(port, hostname, (err, done) => {
    if (!err) {
        console.log(`Server running at http://${hostname}:${port}/`);
    } else {
        console.log("Error in server setup")
    }
})


// var Task = require('./db/taskModel');
// const User = require('mongoose').model('users');
// const main = async function () {
//     //     // const task = await Task.findById('5f25234361f1981d3073bbdb');
//     //     // await task.populate('owner').execPopulate()
//     //     // console.log("owner after populate >> ", task.owner)
//     const user = await User.findById('5f254f9272fdcd0af01f60ab')
//     await user.populate('task').execPopulate()
//     console.log(user.task)
// }
// main()
