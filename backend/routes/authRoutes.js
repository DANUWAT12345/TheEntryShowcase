const express = require('express');
const router = express.Router();
const passport = require('passport');

const { verifyGoogleTokenController } = require('../controllers/authController');
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/'
}),
(req, res) => {
    // Successful authentication, log message and send a response
    console.log('Successful Google authentication');
    res.send('Authentication successful');
});

router.post('/api/auth/verify-token', verifyGoogleTokenController);

module.exports = router;