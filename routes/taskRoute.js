var router = require('express').Router();
var taskModel = require('../db/taskModel');
const auth = require('../middleware/auth');


router.route('/add')
    .post(auth, async (req, res) => {
        if (Object.keys(req.body).length > 0) {
            // var newTask = new taskModel(req.body);
            var newTask = new taskModel({
                ...req.body,
                owner: req.user._id
            })
            try {
                await newTask.save()
                res.status(201).send(`Data has been saved Successfully \n ${newTask}`)
            } catch (e) {
                res.status(500).send(e)
            }
        } else {
            res.status(412).send("Please insert some task related data for adding");
        }
    })

router.route('/')
    .get(auth, async (req, res) => {
        const match = {};
        if (req.query.completed) {
            match.completed = req.query.completed === 'true'
        }

        const sort = {};
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }

        try {
            // console.log(match)
            await req.user.populate({
                path: 'task',
                match,
                options: {
                    limit: parseInt(req.query.limit) ? parseInt(req.query.limit) : 2,
                    skip: parseInt(req.query.skip),
                    sort
                }
            }).execPopulate();
            res.status(200).send(req.user.task)
        } catch (e) {
            res.status(500).send(e)
        }
    })


router.route('/:id')
    .get(auth, async (req, res) => {
        try {
            const task = await taskModel.findOne({ _id: req.params.id, owner: req.user._id })
            if (!task) {
                res.status(400).send();
            }
            res.send(task)
        } catch (e) {
            res.status(500).send(e)
        }
    })

    .patch(auth, async (req, res) => {
        const reqUpdate = Object.keys(req.body);
        const allowedUpdate = ['description', 'completed'];
        const isValid = reqUpdate.every((reqData) => allowedUpdate.includes(reqData))
        if (!isValid) {
            return res.status(400).send({ 'Error': 'Invalid Update Operation' })
        }
        try {
            // var task = await taskModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

            var task = await taskModel.findOne({ _id: req.params.id, owner: req.user._id })

            if (!task) {
                return res.status(404).send()
            }
            reqUpdate.every((reqData) => {
                task[reqData] = req.body[reqData]
            })
            await task.save()
            res.status(201).send(`Task has been successfully updated >>${task}`)
        } catch (e) {
            res.status(500).send(e)
        }

    })

    .delete(async (req, res) => {
        try {
            var task = await taskModel.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
            if (!task) {
                return res.status(404).send()
            }
            res.status(200).send(`Data has been successfully deleted from database >> ${task}`)
        } catch (e) {
            res.status(500).send(e)
        }

    })

module.exports = router;