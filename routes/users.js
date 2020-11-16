const express = require('express');
const router = express.Router();
var methodOverride = require('method-override');
const passport = require('passport');

// Encrypting password
bcrypt = require('bcryptjs');

// override with POST having ?_method=DELETE
router.use(methodOverride('_method'));

const { body, check, validationResult } = require('express-validator');

// Bring in Article Model
let User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register'
    });
});

// Register process
router.post('/register', [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Email is required').notEmpty(),
    body('email', 'Email is not valid').isEmail(),
    body('username', 'Username is required').notEmpty(),
    body('password', 'Password is required').notEmpty(),
    body('password2', 'Confirm your password').notEmpty(),
    check("password", 'Invalid password')
        .isLength({min: 4})
        .custom( (value, {req, loc, path}) => {
            if (value !== req.body.password2) {
                throw new Error("Passwords do not match");
            }
            else {
                return value;
            }
        })        
    ], (req, res) => {
        console.log('POST USER CREATION');
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('register', {
                title: 'Register',
                errors: errors.array()
            })
        }
        else {
            let user = new User();
            user.name = req.body.name;
            user.email = req.body.email;
            user.username = req.body.username;
            user.password = req.body.password;
            
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if (err) {
                        console.log(err);
                        req.flash('danger', 'Cannot generate hash for the password')
                        res.redirect('/');
                    }
                    else {
                        user.password = hash;

                        user.save( (err) => {
                            if (err) {
                                console.log(err);
                                req.flash('danger', 'Cannot Add User');
                                res.redirect('/');
                            }
                            else {
                                req.flash('success', 'You are now registred and can log in');
                                res.render('login');
                            }
                        });
                    }
                })
            })
        }
    }
);

// Login page
router.get('/login', (req, res) => {
    res.render('login');
})

// Login Process
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req , res, next);
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login')
})

module.exports = router;
