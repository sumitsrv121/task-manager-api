const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const fs = require('fs')
const User = require('../model/user')
const auth = require('../middleware/auth')
const { sendWelcomeMail, sendCancelationMail } = require('../emails/account')

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match('.*\.(jpg|jpeg|png)$')) {
            return cb(new Error('Please upload image in jpg/jpeg/png format'))
        }
        cb(undefined, true)
    }
})
const user_router = new express.Router()

//Http user post request
user_router.post('/users', async(req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeMail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send(e)
    }
})

user_router.post('/users/login', async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const authToken = await user.generateAuthToken()

        res.send({
            user,
            authToken
        })
    } catch (error) {
        res.status(403).send({ message: 'Not Authorized', error })
    }
})

user_router.post('/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.status(200).send({ message: 'Successfully logout!' })
    } catch (error) {
        res.send(error)
    }
})

user_router.post('/users/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send({ message: 'Successfully logout from all session!!!!' })
    } catch (error) {
        res.status(500).send()
    }
})

user_router.get('/users', auth, async(req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (error) {
        res.status(500).send(error)
    }
})

user_router.get('/users/me', auth, async(req, res) => {
    res.send(req.user)
})

user_router.get('/users/:id', async(req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if (!user) {
            res.status(404).send({
                message: 'User not found'
            })
        }
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }


})

user_router.patch('/users/me', auth, async(req, res) => {
    const _id = req.user._id
    const updates = Object.keys(req.body)
    const allowedProperty = ['age', 'name', 'email', 'password']
    const isValidOperation = updates.every((update) => {
        return allowedProperty.includes(update)
    })
    if (!isValidOperation) {
        return res.status(400).send({
            message: 'Invalid!!! update'
        })
    }
    try {
        const user = req.user
        updates.forEach((update) => {
            user[update] = req.body[update]
        })
        await user.save()

        if (!user) {
            res.status(404).send({
                message: 'No user found'
            })
        }
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

user_router.delete('/users/me', auth, async(req, res) => {
    try {
        await req.user.remove()
        sendCancelationMail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

user_router.post('/users/me/avatar', auth, upload.single('avatar'), async(req, res) => {
    req.user.avatar = await sharp(req.file.buffer).resize({
            width: 250,
            height: 250
        }).png().toBuffer()
        // req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

user_router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
})

user_router.get('/users/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            throw new Error('User not found')
        }
        if (!user.avatar) {
            throw new Error('No image is associated with this user account')
        }
        res.set('content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send({
            error: error.message
        })
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

module.exports = user_router