const express = require('express')
require('./db/mongoose')
const User = require('./model/user')
const Task = require('./model/task')
const user_router = require('./routers/user')
const task_router = require('./routers/task')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(user_router)
app.use(task_router)

app.listen(port, () => {
    console.log('Server started on port', port)
})