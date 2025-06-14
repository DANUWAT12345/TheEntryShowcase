import 'dotenv/config';
import fs from 'fs';
import https from 'https';
import express from 'express';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('REDIRECT_URI:', process.env.REDIRECT_URI);

const app = express();
app.use(cookieParser());
app.use('/auth', authRoutes);

// Secure HTTPS server
const cert = fs.readFileSync('./cert/cert.pem');
const key = fs.readFileSync('./cert/key.pem');

connectDB();

https.createServer({ key, cert }, app).listen(3000, () => {
  console.log('Server running on https://localhost:3000');
});
