var mongoose = require('mongoose');
const validator = require('validator');
const pbkdf2 = require('pbkdf2');
const jwt = require('jsonwebtoken');
const taskModel = require('./taskModel');


var Schema = mongoose.Schema;
var userSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    age: {
        type: Number,
        // default: 0,
        validate(value) {
            if (value <= 0) {
                throw new Error("Please enter your correct age");
            }
        }
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minlength: [7, "Please ensure strong password and must be greater than 6 six character"],
        validate(value) {
            if (value.includes('password')) {
                throw new Error("password cannot contain 'password'");
            }
        }
    },
    img: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }]
}, {
    timestamps: true
});


userSchema.virtual('task', {
    ref: 'tasks',
    localField: '_id',
    foreignField: 'owner'
})


//middleware for hashing password
//using pbkdf2
userSchema.pre('save', function (next) {
    console.log("password first >> ", this.password)
    if (this.isModified('password') || this.isNew) {
        var buff = pbkdf2.pbkdf2Sync(this.password, 'salt', 1, 32, 'sha512')
        this.password = buff.toString('hex');
    }
    console.log("Password after hashing >> ", this.password)
    next()
})


//delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this;
    await taskModel.deleteMany({ owner: user._id });
    next()
})


//statics since function is called by model itself
// using pbkdf2
userSchema.statics.findByCredentials = async function (email, password) {
    const user = await this.findOne({ email })
    if (!user) {
        throw new Error("Invalid user crendentials")
    }

    var bufferPass = pbkdf2.pbkdf2Sync(password, 'salt', 1, 32, 'sha512')
    var hashPassword = bufferPass.toString('hex');

    // console.log("dbPassword >> ", user.password)
    // console.log("hashPassword >> ", hashPassword)

    var isMatch = (user.password).localeCompare(hashPassword);

    if (isMatch === 0) {
        return user;
    }
    throw new Error("Invalid user Credentials")
}


//methods since function called by instance of mongoose document
userSchema.methods.generateAuthToken = async function () {
    const user = this
    var token = await jwt.sign({ _id: user._id.toString() }, process.env.SECRETKEY);
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token;
}

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.img;

    return userObject;
}

mongoose.model('users', userSchema);
