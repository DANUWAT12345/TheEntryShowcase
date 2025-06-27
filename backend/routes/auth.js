import express from 'express';
import authController from '../controllers/authController.js'; // Import the authController
const router = express.Router();

router.get('/google', (req, res) => {
  const redirectUri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email profile`;
  res.redirect(redirectUri);
});

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  console.log(code);
  // Delegate the handling of the Google callback to the authController
  authController.googleCallback(req, res);
});

router.post('/verify-google-token', authController.verifyGoogleTokenController); 

router.get('/status', authController.checkAuthStatus);

export default router;
