const mongoose = require('mongoose');
const User = mongoose.model('users');
const router = require('express').Router();
const auth = require('../middleware/auth');
const path = require('path');
const sharp = require('sharp');
const { sendMail, sendCancelationMail } = require("../emails/account");


var multer = require('multer');
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(process.cwd(), '/public/images'))
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + '-' + file.originalname)
//     }
// })

var upload = multer({
    // storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter(req, file, cb) {
        var type = file.mimetype.split('/')
        if (type[0] !== 'image') {
            return cb(new Error('Please upload image'))
        }
        cb(null, true)
    }
})


router.route('/signup')
    .post(async (req, res, next) => {
        //let's check if req.body is empty or not
        if (Object.keys(req.body).length > 0) {
            var newUser = new User(req.body);
            try {
                await newUser.save()
                const { email, name } = newUser;
                sendMail(email, 'new User Added', name, 0, 'Signed user');
                var token = await newUser.generateAuthToken();
                res.status(201).send({ newUser, token })
            } catch (e) {
                console.log("Error!... >> ", e);
                res.status(500).send(e)
            }
        } else {
            res.status(412).send("Data with empty fields can't be stored in database")
        }
    })


router.route('/logout')
    .post(auth, async (req, res) => {
        try {
            req.user.tokens = req.user.tokens.filter((token) => { //req.user = user =>auth.js
                return token.token != req.token; //token:{_id,token}
            })
            await req.user.save()
            res.status(200).end()
        } catch (e) {
            res.status(500).end()
        }
    })


router.route('/logoutAll')
    .post(auth, async (req, res) => {
        try {
            const tokenArray = req.user.tokens;
            tokenArray.splice(0, tokenArray.length)
            await req.user.save()
            res.status(200).end()
        } catch (e) {
            res.status(500).end()
        }
    })



router.route('/me')
    .get(auth, async (req, res) => {
        res.status(200).send(req.user);
    })

    .delete(auth, async (req, res) => {
        try {
            // var user = await User.findByIdAndDelete(req.params.id)
            // if (!user) {
            //     return res.status(400).send(`User with ${req.params.id} id is not found for deleting data`)
            // }

            await req.user.remove();
            const { email, name } = req.user;
            sendCancelationMail(email, name)
            res.status(200).send(`Data has been successfully removed from DB >> ${req.user}`)

        } catch (e) {
            res.status(500).send(e)
        }
    })


router.route('/me/edit')
    .patch(auth, async (req, res) => {
        const reqUpdates = Object.keys(req.body);
        console.log("reqUpdates >> ", reqUpdates)
        const allowedUpdates = ['name', 'password', 'email', 'age'];
        const isValid = reqUpdates.every((reqData) => allowedUpdates.includes(reqData));
        if (!isValid) {
            return res.status(400).send({ 'Error': 'Invalid Updates' });
        }
        try {
            //check if email or password are change if then logout  user from all connectr=ed devices
            if (reqUpdates.indexOf('email') != -1 || reqUpdates.indexOf('password') != -1) {
                req.user.tokens = [];
            }
            reqUpdates.forEach((update) => {
                req.user[update] = req.body[update]
            })
            await req.user.save();
            res.status(200).send("You successfully changed login credentials...Please Login now!...")
        } catch (e) {
            res.status(500).send();
        }
    })


router.route('/me/profile')
    .post(auth, upload.single('img'), async function (req, res, next) {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();
        req.user.img = buffer;
        await req.user.save()
        res.status(201).send()
    })
    .delete(auth, async (req, res, next) => {
        var user = req.user;
        try {
            user.img = null;
            await user.save()
            res.status(200).end()
        } catch (e) {
            return new Error("Error during deleting profile pic")
        }
    })


router.route('/:id/profile')
    .get(async (req, res, next) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user || !user.img) {
                throw new Error()
            }
            res.set('Content-Type', 'image/png');
            res.send(user.img)
        } catch (e) {
            res.status(400).send()
        }
    })


router.route('/:id')
    .get(async (req, res) => {
        try {
            var user = await User.findById(req.params.id)
            if (!user) {
                return res.status(400).send(`Data with id ${req.params.id} didn't found in our db`)
            }
            res.status(200).send(`Found >> ${user}`)
        } catch (e) {
            res.status(500).send(e)
        }
    })

    .patch(async (req, res) => {
        const reqUpdates = Object.keys(req.body);
        const allowedUpdates = ['name', 'password', 'email', 'age'];
        const isValid = reqUpdates.every((reqData) => allowedUpdates.includes(reqData));
        if (!isValid) {
            return res.status(400).send({ 'Error': 'Invalid Updates' });
        }
        try {
            // var user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            // findByIdAndUpdate will work directly with db so it didn't pass through our schema thus we do following

            var user = await User.findById(req.params.id)
            if (!user) {
                return res.status(400).send(`User with ${req.params.id} id is not found for updating data`)
            }
            reqUpdates.forEach((update) => {
                user[update] = req.body[update]
            })
            await user.save()
            res.status(201).send(`Data has been successfully updated >> ${user}`)
        } catch (e) {
            res.status(500).send(e)
        }

    })




router.route('/login')
    .post(async (req, res) => {
        try {
            const user = await User.findByCredentials(req.body.email, req.body.password)
            const token = await user.generateAuthToken();
            res.status(200).send({ user, token }) //if you place user with string error occured during setting env of token in postman
        } catch (e) {
            console.log(e);
            res.status(400).end();
        }
    })

module.exports = router;
