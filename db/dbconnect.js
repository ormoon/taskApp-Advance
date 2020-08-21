const moongoose = require('mongoose');
const userModel = require('./userModel');
const TaskModel = require('./taskModel');
const url = "mongodb://127.0.0.1:27017/taskApp";

moongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
    .then(resolve => {
        console.log("-------------Database Connection Success---------------");
    })
    .catch(reject => {
        console.log("----Error!---Error during connection to the database----");
    })