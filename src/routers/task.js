const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../model/task')

const task_router = new express.Router()

//Http task post request
task_router.post('/tasks', auth, async(req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

task_router.get('/tasks', auth, async(req, res) => {
    const match = {}
    const sort = {}
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    try {
        // const tasks = await Task.find({
        //     owner: req.user._id
        // })
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.send(error)
    }
})

task_router.get('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id
    try {
        //const task = await Task.findById(_id)
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        })
        if (!task) {
            res.status(404).send({
                message: "Task not found"
            })
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

task_router.patch('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id
    const allowedProperty = ['description', 'completed']
    const upadtes = Object.keys(req.body)
    const isValidOperation = upadtes.every((update) => allowedProperty.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            message: 'Not a valid update'
        })
    }
    try {
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        })

        if (!task) {
            return res.status(404).send({
                message: 'Task not found'
            })
        }

        upadtes.forEach((update) => task[update] = req.body[update])

        await task.save()

        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

task_router.delete('/tasks/:id', auth, async(req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        })
        if (!task) {
            return res.status(404).send({
                error: "No task found"
            })
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})


module.exports = task_router