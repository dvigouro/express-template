const express = require('express');
const router = express.Router();
var methodOverride = require('method-override');

// override with POST having ?_method=DELETE
router.use(methodOverride('_method'));

const { body, validationResult } = require('express-validator');

// Import logger
const log = require('../config/logger');

// Bring in Article Model
let Article = require('../models/article');
// Bring in the User Model
let User = require('../models/user');

// Add Route
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add_article', {
        title: 'Add Articles'
    });
});

// Add Submit POST Route
router.post('/add', ensureAuthenticated, [
    // title must not be empty
    body('title', 'title is mandatory').notEmpty(),
    //body('author', 'author is mandatory').notEmpty(),
    body('body', 'body is mandatory').notEmpty(),
    ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('add_article', {
            title: 'Add Articles',
            errors: errors.array()
        })
    }
    else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save( (err) => {
            if (err) {
                log.error(err);
                req.flash('danger', 'Cannot Add Article');
                res.redirect('/');
            }
            else {
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
    }
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (err) {
            log.error(err);
            req.flash('danger', 'Cannot Edit Article');
            res.redirect('/');
        }
        else {
            if (article.author != req.user._id) {
                req.flash('danger', 'Not Authorized');
                res.redirect('/');
            }
            else {
                res.render('edit_article', {
                    title: 'Edit Article',
                    article: article
                });
            }
        }
    });
});

// Edit Submit POST Route
router.post('/edit/:id', ensureAuthenticated, [
    body('title', 'title is mandatory').notEmpty(),
    body('body', 'body is mandatory').notEmpty(),
    ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //res.status(200).json(errors.array()[0].msg)
        req.flash('danger', errors.array()[0].msg);
        res.redirect('/articles/edit/'+req.params.id);
    }
    else {
        let article = {}
        article.title = req.body.title;
        article.body = req.body.body;

        let query = {_id: req.params.id}

        Article.updateOne(query, article, (err, article) => {
            if (err) {
                log.error(err);
                req.flash('danger', 'Cannot Update Article');
                res.redirect('/');
            }
            else {
                req.flash('success', 'Article Updated');
                res.redirect('/');
            }
        });
    }
});

// Delete Article
router.delete('/:id', ensureAuthenticated, (req, res) => {
    let query = {_id: req.params.id}

    if (!req.user._id) {
        req.flash('danger', 'Please login');
        res.redirect('/');
    }
    else {
        Article.findById(req.params.id, (err, article) => {
            if (err) {
                req.flash('danger', 'Article not found');
                res.redirect('/');
            }
            else {
                if (article.author != req.user._id) {
                    req.flash('danger', 'Not Authorized');
                    res.redirect('/');
                }
                else {
                    Article.deleteOne(query, (err) =>{
                        if (err) {
                            log.error(err);
                            req.flash('danger', 'Cannot Delete Article');
                            res.redirect('/');
                        }
                        else {
                            req.flash('success', 'Article Deleted');
                            res.redirect('/');
                        }
                    })
                }
            }

        })
    }
});

// Get single Article
router.get('/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (err) {
            log.error(err);
            req.flash('danger', 'Cannot Display Article');
            res.redirect('/')
        }
        else {
            User.findById(article.author, (err, user) => {
                if (err) {
                    log.error(err);
                    req.flash('Author not found');
                    res.redirect('/');
                }
                else {
                    res.render('article', {
                        article: article,
                        author: user.name
                    });
                }
            })
        }
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;
