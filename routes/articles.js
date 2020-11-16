const express = require('express');
const router = express.Router();
var methodOverride = require('method-override');

// override with POST having ?_method=DELETE
router.use(methodOverride('_method'));

const { body, validationResult } = require('express-validator');

// Bring in Article Model
let Article = require('../models/article');

// Add Route
router.get('/add', (req, res) => {
    res.render('add_article', {
        title: 'Add Articles'
    });
});

// Add Submit POST Route
router.post('/add', [
    // title must not be empty
    body('title', 'title is mandatory').notEmpty(),
    body('author', 'author is mandatory').notEmpty(),
    body('body', 'body is mandatory').notEmpty(),
    ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('add_article', {
            title: 'Add Articles',
            errors: errors.array()
        })
        //return res.status(400).json({ errors: errors.array() });
    }
    else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.body.author;
        article.body = req.body.body;

        article.save( (err) => {
            if (err) {
                console.log(err);
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
router.get('/edit/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (err) {
            console.log(err);
            req.flash('danger', 'Cannot Edit Article');
            res.redirect('/');
        }
        else {
            res.render('edit_article', {
                title: 'Edit Article',
                article: article
            });
        }
    });
});

// Edit Submit POST Route
router.post('/edit/:id', (req, res) => {
    let article = {}
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id: req.params.id}

    Article.updateOne(query, article, (err, article) => {
        if (err) {
            console.log(err);
            req.flash('danger', 'Cannot Update Article');
            res.redirect('/');
        }
        else {
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });
});

// Delete Article
router.delete('/:id', (req, res) => {
    let query = {_id: req.params.id}

    Article.deleteOne(query, (err) =>{
        if (err) {
            console.log(err);
            req.flash('danger', 'Cannot Delete Article');
            res.redirect('/');
        }
        else {
            req.flash('success', 'Article Deleted');
            res.redirect('/');
        }
    })
});

// Get single Article
router.get('/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (err) {
            console.log(err);
            req.flash('danger', 'Cannot Display Article');
            res.redirect('/')
        }
        else {
            res.render('article', {
                article: article
            });
        }
    });
});

module.exports = router;
