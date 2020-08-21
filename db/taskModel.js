const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var taskSchema = new Schema({
    description: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    }
}, {
    timestamps: true
})


module.exports = mongoose.model('tasks', taskSchema);