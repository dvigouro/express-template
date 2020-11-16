// Load Mongodb parameters
require('dotenv').config()

module.exports = {
    database: process.env.MONGODB_URI,
    secret: process.env.MONGODB_SECRET,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
}