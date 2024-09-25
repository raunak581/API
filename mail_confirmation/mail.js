const nodemailer = require('nodemailer');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

// Function to send confirmation email
async function sendConfirmationEmail(userEmail) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use any email service
    auth: {
      user: 'raunakdubey681@gmail.com',
      pass: 'yrmn zzvz albw hzii',
    },
  });

  console.log(transporter,"this");
  

  const url = `http://yourdomain.com/confirm/`;

  await transporter.sendMail({
    to: userEmail,
    subject: 'Confirm your email',
    html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
  });
}
sendConfirmationEmail("rsdubey681@gmail.com");