// controllers/authController.js
import jwt from 'jsonwebtoken';
import AuthService from '../services/authService.js'; // Assuming authService.js is in the services folder
// Replace with your actual credentials and redirect URI
const authService = new AuthService(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const authController = {
  googleCallback: async (req, res) => {
    const { code } = req.query;
    console.log("Received Google auth code:", code);
    console.log("Backend Host", process.env.BACKEND_HOST);
    try {
      // Use the instantiated authService to handle the callback
      const { user, jwtToken } = await authService.handleGoogleCallback(code);

      // Set the JWT as an HTTP-only cookie
      res.cookie('jwt', jwtToken, {
        httpOnly: true,
        secure: true, // Should be true since your Cloud Workstation is HTTPS
        domain: process.env.BACKEND_HOST // Explicitly set the domain
      });

      console.log("google callback success")
      console.log("jwtToken init set as: " , jwtToken)
      console.log('App JWT token set as cookie and stored in Redis by AuthService');
      res.redirect(process.env.FRONTEND_URL + "/Home");
    } catch (error) {
      console.error('Error in Google callback controller:', error);
      // Handle errors (e.g., redirect to an error page)
      console.log("error auth check failed")
      res.redirect(process.env.FRONTEND_URL + "/auth-error?error=auth_check_failed");
    }
  },
  
  checkAuthStatus: async (req, res) => {
    try {
      const jwtToken = req.cookies.jwt;
      console.log("jwtToken :", jwtToken)
      if (!jwtToken) {
        return res.status(401).json({ isAuthenticated: false, message: 'No JWT token found.' });
      }

      // Verify the JWT (same logic as your middleware would have done)
      const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET);
      const userId = decodedToken.id;

      // Check token in Redis
      const redisToken = await authService.getJwtFromRedis(userId); // Assuming you add this method to AuthService
      if (redisToken && redisToken === jwtToken) {
        return res.status(200).json({ isAuthenticated: true, userId: userId });
      } else {
        return res.status(401).json({ isAuthenticated: false, message: 'Token mismatch or not found in Redis.' });
      }
    } catch (error) {
      console.error('Error in checkAuthStatus:', error);
      // If token is expired or invalid, jwt.verify will throw an error
      return res.status(401).json({ isAuthenticated: false, message: 'Invalid or expired token.' });
    }
  },

  verifyGoogleTokenController: async (req, res) => {
    // This controller will be implemented in the next step
  },
};

export default authController;