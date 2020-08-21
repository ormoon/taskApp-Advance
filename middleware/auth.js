var jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('users');

const auth = async (req, res, next) => {
    try {
        const token = req.headers['authorization'].replace("Bearer ", "");
        var decoded = jwt.verify(token, process.env.SECRETKEY)
        var user = await User.findOne({ _id: decoded['_id'], 'tokens.token': token })
        if (!user) {
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next()
    } catch (e) {
        res.status(401).send({ error: "Please authenticate" })
    }

}

module.exports = auth;