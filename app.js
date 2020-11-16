const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');

// Database Connection
mongoose.connect('mongodb://localhost:27017/nodekb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
let db = mongoose.connection;
// Check connection
db.once('open', (err) => console.log('Connected to MOngoDB'))
// Check DB errors
db.on('error', (err) => console.log(err))

// Init App
const app = express();

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

// Bring in Article Model
let Article = require('./models/article');

// Home Route
app.get('/', (req , res) => {
    let articles = Article.find({}, (err, articles) => {
        if (err) {
            console.log(err)
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

// Start Server
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
});