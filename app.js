const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');

// Manage Security :
//  * https://expressjs.com/en/advanced/best-practice-security.html
//  * https://blog.risingstack.com/node-js-security-checklist/
const helmet = require('helmet');

// Database Connection
const configdb = require('./config/database');
mongoose.connect(configdb.database, configdb.options);
let db = mongoose.connection;
// Check connection
db.once('open', (err) => log.info('Connected to MOngoDB'));
// Check DB errors
db.on('error', (err) => log.error(err));

// Create logger
const log = require('./config/logger');
// Use uuid to identify the request/response in logs
const uuid = require('uuid');

// http://expressjs.com/en/resources/middleware/errorhandler.html
// This middleware is only intended to be used in a development environment, 
// as the full error stack traces and internal details of any object passed
// to this module will be sent back to the client when an error occur
const errorhandler = require("errorhandler");

// Init App
const app = express();

// Activate the extended error trace in development
if (process.env.NODE_ENV !== 'production') {
    app.use(errorhandler())
}

// Create request/response logger
app.use( (req, res, next) => {
    req.log = log.child({ req_id: uuid.v4()}, true);
    req.log.info({ req });
    res.on('finish', () => req.log.info({ res }));
    next();
});

// Activate security protection
app.use(helmet());

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Passport Config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
})

// Bring in Article Model
let Article = require('./models/article');

// Home Route
app.get('/', (req , res) => {
    let articles = Article.find({}, (err, articles) => {
        if (err) {
            log.error(err)
        }
        else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
    })
});

// Route files
let articles = require('./routes/articles');
app.use('/articles', articles);
let users = require('./routes/users');
app.use('/users', users);

// Generate a fake error
app.get("/error", (req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        throw new Error("Something went wrong");
    }
    next();
});

// Catch any errors
app.use( (err, req, res, next) => {
    req.log.error({ err });
    res.render('error', {
        exception: err.message
    });
});

// Last Route to catch 404 Not found errors
app.use( (req, res, next) => {
    res.status(404).render('404');
});

// Start Server
const port = process.env.PORT || 3000;

app.listen(port, () => {
    log.info(`Server started on port ${port}`)
});

module.exports = app;