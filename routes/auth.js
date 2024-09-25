const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();
const nodemailer = require('nodemailer');

// Register User
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'raunakdubey681@gmail.com',
    pass: 'yrmn zzvz albw hzii',
  },
});


// Registration Route
router.post('/register', async (req, res) => {
  const { username, email, mobile, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user (but set as inactive initially)
    user = await User.create({
      username,
      email,
      mobile,
      password: hashedPassword,
      isConfirmed: false, // User is not confirmed initially
    });

    // Create email confirmation token
    const emailConfirmationToken = jwt.sign(
      { email: user.email },
      's3cr3tK3y@2024!jwt', // Replace with your JWT secret
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send confirmation email
    const confirmationUrl = `http://your-domain.com/confirm-email/${emailConfirmationToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Email Confirmation',
      html: `<p>Please confirm your email by clicking the following link: <a href="${confirmationUrl}">${confirmationUrl}</a></p>`,
    });
    console.log(emailConfirmationToken);
    

    // Return a success message
    res.json({ msg: 'Registration successful! Please check your email to confirm your account.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Email Confirmation Route
router.get('/confirm-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, 's3cr3tK3y@2024!jwt'); // Replace with your JWT secret

    // Find the user by email
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid token' });
    }

    // Check if user is already confirmed
    if (user.isConfirmed) {
      return res.status(400).json({ msg: 'Email is already confirmed' });
    }

    // Update the user's isConfirmed field
    user.isConfirmed = true;
    await user.save(); // Save the user with the updated isConfirmed status

    // Check if the update was successful
    const updatedUser = await User.findOne({ where: { email: decoded.email } });

    if (updatedUser.isConfirmed) {
      res.json({ msg: 'Email confirmed successfully! Your account is now active.' });
    } else {
      res.status(500).json({ msg: 'Error updating confirmation status in the database' });
    }
  } catch (err) {
    console.error(err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ msg: 'Confirmation link has expired' });
    }

    res.status(500).send('Server error');
  }
});







// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Check if the user's email is confirmed
    if (!user.isConfirmed) {
      return res.status(400).json({ msg: 'Please confirm your email before logging in' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        userEmail: user.email,
      },
    };

    jwt.sign(
      payload,
      's3cr3tK3y@2024!jwt', // Replace with your JWT secret
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          userId: user.id,
          userEmail: user.email,
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;
