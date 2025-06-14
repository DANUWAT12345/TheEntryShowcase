import express from 'express';
import axios from 'axios';
import User from '../models/User.js'; // Assuming User model uses export default
import { createToken } from '../utils/jwt.js'; // Assuming jwt utility uses named export
import redisClient from '../config/redis.js'; // Assuming redis config uses export default
const router = express.Router();

router.get('/google', (req, res) => {
  const redirectUri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=email profile`;
  console.log(redirectUri)
  res.redirect(redirectUri);
});

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenRes.data;

    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id, name, email, picture } = userInfo.data;

    let user = await User.findOne({ googleId: id });
    if (!user) {
      user = await User.create({ googleId: id, name, email, avatar: picture });
    }

    const jwtToken = createToken({ id: user._id });

    // Save JWT in Redis
    await redisClient.set(user._id.toString(), jwtToken, { EX: 3600 });

    res.cookie('token', jwtToken, { httpOnly: true, secure: true });
    res.redirect('/Home');
  } catch (err) {
    console.error(err);
    res.status(500).send('Login failed');
  }
});

export default router;
