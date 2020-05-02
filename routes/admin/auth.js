const express = require('express');

const { handleErrors } = require('./middleware');
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const { requireEmail, requirePassword, requirepasswordConfirmation, requireExistsEmail, requireExistsPassword } = require('./validators');

const router = express.Router();

router.get('/signup', (req, res) => {
    res.send(signupTemplate({req}));
});

router.post('/signup', 
    [ requireEmail, requirePassword, requirepasswordConfirmation ],
    handleErrors(signupTemplate),  
    async (req, res) => {
        const { email, password } = req.body;

        //CREATE A USER IN OUR USER REPO TO REPRESENT THIS PERSON 
        const user = await usersRepo.create({ email: email, password: password });

        //STORE THE ID OF THAT USER INSIDE THE USER COOKIE
        req.session.userId = user.id;

        res.redirect('/admin/products');
    
});

router.get('/signout', (req, res) => {
    req.session = null;
    res.send('You are logged out!');
});

router.get('/signin', (req, res) => {
    res.send(signinTemplate({}));
});

router.post('/signin',
             [ requireExistsEmail, requireExistsPassword ],
             handleErrors(signinTemplate),   
             async (req, res) => {
                const { email } = req.body;

                const user = await usersRepo.getOneBy({ email: email });

                req.session.userId = user.id;

                res.redirect('/admin/products');
            });

module.exports = router;