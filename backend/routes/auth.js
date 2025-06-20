import express from 'express';
import redisClient from '../config/redis.js'; 
import AuthService from '../services/authService.js'; 
const router = express.Router();

router.get('/google', (req, res) => {
  const redirectUri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=email profile`;
  res.redirect(redirectUri);
});

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  console.log(code);
  try {
    // Instantiate AuthService here after environment variables are loaded
    const authService = new AuthService(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
    // Call the service function to handle the Google callback logic
    const { user, jwtToken } = await authService.handleGoogleCallback(code);
    console.log(jwtToken);

    await redisClient.set(user._id.toString(), jwtToken, { EX: 3600 });

    res.cookie('token', jwtToken, { httpOnly: true, secure: true });
    res.redirect(process.env.FRONTEND_URL + "/Home");
  } catch (err) {
    console.error(err);
    res.status(500).send('Login failed');
  }
});

export default router;
