const mongoose = require('mongoose')

mongoose.connect(process.env.connectionURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})