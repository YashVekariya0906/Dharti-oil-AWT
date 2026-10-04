const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log(' Real Gmail transporter configured for production use');
} else {
  console.log(' Email functionality disabled - using test mode');
}

module.exports = transporter;
