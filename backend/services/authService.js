// backend/services/authService.js
import { OAuth2Client } from 'google-auth-library';

class AuthService {
  constructor(clientId, clientSecret, redirectUri) {
    this.client = new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  async verifyGoogleToken(token) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.client.clientId, // Specify the CLIENT_ID of the app that accesses the backend
      });
      const payload = ticket.getPayload();
      // You can access user information from the payload, e.g., payload['sub'], payload['email'], payload['name']
      return payload;
    } catch (error) {
      console.error('Error verifying Google token:', error);
      throw new Error('Invalid Google token');
    }
  }

  // Add other authentication-related functions here
}

export default AuthService;