const jwt = require('jsonwebtoken')
const User = require('../model/user')

const auth = async(req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        console.log(token)
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        console.log(decode)

        const user = await User.findOne({ _id: decode._id, 'tokens.token': token })
        if (!user) {
            throw new Error('Invalid User')
        }
        req.token = token
        req.user = user
        next()
    } catch (error) {
        res.status(401).send('Please Authenticate.')
    }
}


module.exports = auth