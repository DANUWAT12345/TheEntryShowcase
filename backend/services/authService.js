// backend/services/authService.js
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { createToken } from '../utils/jwt.js';
import redisClient from '../config/redis.js';

class AuthService {
  constructor(clientId, clientSecret, redirectUri) {
    this.client = new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  async handleGoogleCallback(code) {
    try {
      // Exchange the authorization code for tokens
      const { tokens } = await this.client.getToken(code);
      const idToken = tokens.id_token;
      const accessToken = tokens.access_token;

      // Verify the ID token and get user info
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: this.client.clientId,
      });
      const payload = ticket.getPayload();
      const { sub: id, name, email, picture } = payload; // Use 'sub' as Google ID

      // Find or create the user in your database
      let user = await User.findOne({ googleId: id });
      if (!user) {
        user = await User.create({ googleId: id, name, email, avatar: picture });
        console.log("User created in DB");
      }

      // Create your internal JWT
      const jwtToken = createToken({ id: user._id });
      console.log("Internal JWT created");

      // Save JWT in Redis
      await redisClient.set(user._id.toString(), jwtToken, { EX: 3600 });
      console.log("JWT saved in Redis");

      return { user, jwtToken };
    } catch (error) {
      console.error('Error handling Google callback:', error.message);
      throw new Error('Failed to process Google login');
    }
  }

  async verifyGoogleToken(token) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.client.clientId,
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      console.error('Error verifying Google token:', error);
      throw new Error('Invalid Google token');
    }
  }
}

export default AuthService;