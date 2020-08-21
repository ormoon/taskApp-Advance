require('../db/dbconnect');
const mongoose = require('mongoose');
const User = mongoose.model('users');


var updateAgeAndCount = async (id, age) => {
    const user = await User.findByIdAndUpdate(id, { age });//await function returns the Promise and only use inside async function
    const count = await User.countDocuments({ age });
    return user;
}

updateAgeAndCount('5f1949073afb3a341cf19fe2', 2)
    .then(success => console.log(success))
    .catch(err => {
        console.log(err)
    })


// var a = async () => {};
//  console.log(a())