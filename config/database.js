// Load Mongodb parameters
require('dotenv').config()

if (process.env.NODE_ENV === 'production') {
    module.exports = {
        database: process.env.MONGODB_URI,
        secret: process.env.MONGODB_SECRET,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    }
}
else {
    module.exports = {
        database: 'mongodb://localhost:27017/nodekb?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false',
        secret: 'My Secret',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    }
}
