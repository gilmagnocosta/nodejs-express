const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');
const jwtConfig = require('../../config/auth');
const User = require('../../app/models/user');

const router = express.Router();

function generateToken(params = {}){
    return jwt.sign(params, jwtConfig.secret, {
        expiresIn: 20000,
    });
}

router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email }))
            return res.status(400).send({ error: 'User already exists'});

        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({
            user,
            token: generateToken({ id: user.id }),
        });
    } catch (err){
        return res.status(400).send({ error: 'Registration failed' });
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user)
        return res.status(400).send({ error: 'User not found'});

    if (!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Invalid password'});

    user.password = undefined;

    return res.send({ 
        user, 
        token: generateToken({ id: user.id }),
    });
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {

        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).send({ error: 'User not found'});

        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 2);
        
        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpiresTime: now,
            }
        });

        mailer.sendMail({
            to: email,
            from: 'gilmagno.costa@gmail.com',
            template: 'auth/forgot-password',
            context: { token },
        }, (err) => {
            if (err)
                return res.status(400).send( { error: 'Error on forgot password'} )

            return res.send();
        });

    } catch (err){
        res.status(400).send({ error: 'Error in forgot password request'})
    }
});

router.post('/reset-password', async (req, res) => {
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpiresTime');

        if (!user)
            return res.status(400).send({ error: 'User not found'});

        if (token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Invalid token'});

        if (new Date() > user.passwordResetExpiresTime)
            return res.status(400).send({ error: 'Token expired, try generate a new one'});

        user.password = password;

        await user.save();

        res.send();


    } catch (err) {
        res.status(400).send({ error: 'Cannot reset your password, please try again later'});
    }
});

module.exports = app => app.use('/auth', router);