require('../db/dbconnect')
var taskModel = require('../db/taskModel');


// taskModel.findByIdAndRemove('5f1c26c01d41a921d47142e2').then(removed => {
//     console.log(removed);
//     return taskModel.countDocuments({ completed: false }).then(count => {
//         console.log(count)
//     })
// }).catch(err => {
//     console.log("nklcd >> ", err)
// })


// const add = (a, b) => {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve(a + b);
//         }, 2000)
//     })
// }

// const doWork = async () => {
//    return await add(2, 3);

// }

// doWork().then(data => {
//     console.log("Data >> ", data)
// }).catch(err => {
//     console.log("Error >> ", err)
// })


const deleteTaskAndCount = async (id) => {
    const remove = await taskModel.findByIdAndDelete(id);
    const count = await taskModel.countDocuments({ completed: false });
    return count;
}


deleteTaskAndCount('5f1c26ac1d41a921d47142e1')
    .then(success => {
        console.log(success)
    })
    .catch(err => {
        console.log(err);
    })