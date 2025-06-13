import jwt from 'jsonwebtoken';

const createToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

export { createToken, verifyToken };
