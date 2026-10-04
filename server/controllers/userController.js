const { User } = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const transporter = require('../config/email');

// POST register user
const registerUser = async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const moblie_no = (req.body.moblie_no || '').trim();
    const emali = (req.body.emali || '').trim().toLowerCase();
    const address = (req.body.address || '').trim();
    const pincode = (req.body.pincode || '').trim();
    const password = (req.body.password || '').trim();
    const role = req.body.role || 'user';

    if (!username || !moblie_no || !emali || !address || !pincode || !password) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ emali }, { moblie_no }]
      }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User with this Email or Mobile Number already exists!' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n[OTP GENERATED] Code for ${emali}: ${otpCode}\n`);

    const user = await User.create({
      username,
      moblie_no,
      emali,
      address,
      pincode,
      password: hashedPassword,
      role: role || 'user',
      otp_code: otpCode,
      otp_expiry: new Date(Date.now() + 10 * 60 * 1000)
    });

    try {
      await transporter.sendMail({
        from: `"Dharti Oil App" <${process.env.EMAIL_USER}>`,
        to: emali,
        subject: 'Verify Your Email - Dharti Oil Registration',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d5a27;">Welcome to Dharti Oil!</h2>
            <p>Thank you for registering with us. To complete your registration, please verify your email address.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h3 style="color: #2d5a27; margin: 0;">Your Verification Code</h3>
              <p style="font-size: 32px; font-weight: bold; color: #2d5a27; margin: 10px 0; letter-spacing: 5px;">${otpCode}</p>
              <p style="color: #666; margin: 0;">This code will expire in 10 minutes</p>
            </div>
            <p>If you didn't request this registration, please ignore this email.</p>
            <p>Best regards,<br>Dharti Oil Team</p>
          </div>
        `,
        text: `Welcome to Dharti Oil! Your verification code is: ${otpCode}. This code will expire in 10 minutes.`
      });
      console.log(` [EMAIL SENT] OTP sent successfully to ${emali}`);
    } catch (emailError) {
      console.error(' [EMAIL FAILED] Could not send OTP to:', emali, emailError.message);
      await User.destroy({ where: { user_id: user.user_id } });
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email for verification code.',
      email: emali,
      requires_verification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST resend OTP
const resendOtp = async (req, res) => {
  try {
    const { emali } = req.body;

    if (!emali) {
      return res.status(400).json({ message: 'Email is required!' });
    }

    const user = await User.findOne({
      where: {
        emali: emali,
        otp_code: { [Op.ne]: null }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'No unverified account found with this email.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n[OTP REGENERATED] New code for ${emali}: ${otpCode}\n`);

    await User.update({
      otp_code: otpCode,
      otp_expiry: new Date(Date.now() + 10 * 60 * 1000)
    }, {
      where: { user_id: user.user_id }
    });

    try {
      await transporter.sendMail({
        from: `"Dharti Oil App" <${process.env.EMAIL_USER}>`,
        to: emali,
        subject: 'New Verification Code - Dharti Oil Registration',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d5a27;">Dharti Oil - New Verification Code</h2>
            <p>You requested a new verification code. Here it is:</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h3 style="color: #2d5a27; margin: 0;">Your New Verification Code</h3>
              <p style="font-size: 32px; font-weight: bold; color: #2d5a27; margin: 10px 0; letter-spacing: 5px;">${otpCode}</p>
              <p style="color: #666; margin: 0;">This code will expire in 10 minutes</p>
            </div>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>Dharti Oil Team</p>
          </div>
        `,
        text: `Your new verification code is: ${otpCode}. This code will expire in 10 minutes.`
      });
      console.log(` [OTP RESENT] New OTP sent to ${emali}`);
      res.status(200).json({ message: 'New verification code sent to your email.', email: emali });
    } catch (emailError) {
      console.error(' [EMAIL FAILED] Could not resend OTP to:', emali, emailError.message);
      return res.status(500).json({ message: 'Failed to send email. Please try again.' });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend verification code.' });
  }
};

// POST verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { emali, otp_code } = req.body;

    if (!emali || !otp_code) {
      return res.status(400).json({ message: 'Email and OTP code are required!' });
    }

    const user = await User.findOne({
      where: {
        emali: emali,
        otp_code: otp_code,
        otp_expiry: { [Op.gte]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification code. Please request a new one.'
      });
    }

    await User.update({
      otp_code: null,
      otp_expiry: null
    }, {
      where: { user_id: user.user_id }
    });

    console.log(` [OTP VERIFIED] User ${emali} successfully verified`);

    res.status(200).json({
      message: 'Email verified successfully! You can now login.',
      verified: true,
      email: emali
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
};

// POST login
const loginUser = async (req, res) => {
  try {
    const emaliRaw = (req.body.emali || '').trim();
    const password = (req.body.password || '').trim();
    const emali = emaliRaw.toLowerCase();

    if (!emali || !password) {
      return res.status(400).json({ message: 'Email and password are required!' });
    }

    const user = await User.findOne({ where: { emali } });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email.' });
    }

    if (user.otp_code !== null) {
      return res.status(403).json({
        message: 'Please verify your email first before logging in.',
        requires_verification: true,
        email: emali
      });
    }

    if (user.role === 'broker' && user.status !== 'Active') {
      return res.status(403).json({ message: 'Broker account is inactive.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const userResponse = {
      user_id: user.user_id,
      username: user.username,
      emali: user.emali,
      moblie_no: user.moblie_no,
      address: user.address,
      pincode: user.pincode,
      role: user.role,
      commission_percent: user.commission_percent || 0,
      status: user.status || 'Active'
    };

    console.log(` [LOGIN SUCCESS] User ${emali} logged in successfully`);

    res.status(200).json({ message: 'Login successful!', user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// GET user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      user_id: user.user_id,
      username: user.username,
      emali: user.emali,
      moblie_no: user.moblie_no,
      address: user.address,
      pincode: user.pincode,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, moblie_no, address, pincode, new_emali } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (new_emali && new_emali !== user.emali) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`\n[OTP GENERATED] Code for email change ${new_emali}: ${otpCode}\n`);

      await User.update({
        username: username || user.username,
        moblie_no: moblie_no || user.moblie_no,
        address: address || user.address,
        pincode: pincode || user.pincode,
        otp_code: otpCode,
        otp_expiry: new Date(Date.now() + 10 * 60 * 1000)
      }, { where: { user_id: id } });

      try {
        if (transporter) {
          await transporter.sendMail({
            from: `"Dharti Oil App" <${process.env.EMAIL_USER}>`,
            to: new_emali,
            subject: 'Verify Your New Email - Dharti Oil',
            html: `<p>Your verification code is: ${otpCode}</p>`
          });
        }
      } catch (e) {
        console.error('Failed to send email:', e);
      }
      return res.status(200).json({ message: 'Profile updated. OTP sent to verify new email.', email_changed: true, new_emali });
    } else {
      await User.update({
        username: username || user.username,
        moblie_no: moblie_no || user.moblie_no,
        address: address || user.address,
        pincode: pincode || user.pincode
      }, { where: { user_id: id } });
      return res.status(200).json({ message: 'Profile updated successfully!', email_changed: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST verify user email change
const verifyUserEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_emali, otp_code } = req.body;

    const user = await User.findOne({
      where: {
        user_id: id,
        otp_code,
        otp_expiry: { [Op.gte]: new Date() }
      }
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP.' });

    await User.update({ emali: new_emali, otp_code: null, otp_expiry: null }, { where: { user_id: id } });
    res.status(200).json({ message: 'Email updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT change user password
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(current_password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    await User.update({ password: hashedPassword }, { where: { user_id: id } });

    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST forgot password - send OTP
const forgotPasswordSendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ where: { emali: email.toLowerCase(), role: 'user' } });
    if (!user) {
      return res.status(404).json({ message: 'User not found or not eligible for this feature.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n[FORGOT PASSWORD OTP] Code for ${email}: ${otpCode}\n`);

    await User.update({
      otp_code: otpCode,
      otp_expiry: new Date(Date.now() + 10 * 60 * 1000)
    }, { where: { user_id: user.user_id } });

    try {
      if (transporter) {
        await transporter.sendMail({
          from: `"Dharti Oil App" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Password Reset Verification - Dharti Oil',
          html: `<p>Your password reset verification code is: <strong>${otpCode}</strong></p><p>This code will expire in 10 minutes.</p>`
        });
      }
    } catch (e) {
      console.error('Failed to send reset OTP email:', e);
    }

    res.status(200).json({ message: 'OTP sent successfully to your email.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST forgot password - reset
const forgotPasswordReset = async (req, res) => {
  try {
    const { email, otp_code, new_password } = req.body;
    if (!email || !otp_code || !new_password) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    const user = await User.findOne({
      where: {
        emali: email.toLowerCase(),
        role: 'user',
        otp_code,
        otp_expiry: { [Op.gte]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    await User.update({
      password: hashedPassword,
      otp_code: null,
      otp_expiry: null
    }, { where: { user_id: user.user_id } });

    res.status(200).json({ message: 'Password reset successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST send OTP for email change
const sendOtpForEmailChange = async (req, res) => {
  try {
    const { email, user_id } = req.body;

    if (!email || !user_id) {
      return res.status(400).json({ message: 'Email and user ID are required' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n[OTP GENERATED] Code for ${email}: ${otpCode}\n`);

    await User.update({
      otp_code: otpCode,
      otp_expiry: new Date(Date.now() + 10 * 60 * 1000)
    }, { where: { user_id } });

    try {
      if (transporter) {
        await transporter.sendMail({
          from: `"Dharti Oil App" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Verify Your New Email - Dharti Oil',
          html: `<p>Your verification code is: <strong>${otpCode}</strong></p><p>This code will expire in 10 minutes.</p>`
        });
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send OTP:', emailError.message);
    }

    res.status(200).json({ message: 'OTP sent successfully', email });
  } catch (error) {
    console.error(' Error sending OTP:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST verify OTP for email change
const verifyOtpForEmailChange = async (req, res) => {
  try {
    const { email, otp_code, user_id } = req.body;

    if (!email || !otp_code || !user_id) {
      return res.status(400).json({ message: 'Email, OTP, and user ID are required' });
    }

    const user = await User.findOne({
      where: {
        user_id,
        otp_code,
        otp_expiry: { [Op.gte]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await User.update({
      emali: email,
      otp_code: null,
      otp_expiry: null
    }, { where: { user_id } });

    console.log(` [OTP VERIFIED] User ${user_id} email changed to ${email}`);

    res.status(200).json({ message: 'Email verified and updated successfully!' });
  } catch (error) {
    console.error(' Error verifying OTP:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT update user profile (via body user_id)
const updateProfile = async (req, res) => {
  try {
    const { user_id, username, emali, moblie_no, address, pincode, otp_code } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (otp_code) {
      if (!user.otp_code || user.otp_code !== otp_code || user.otp_expiry < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
      }

      await User.update({
        username: username || user.username,
        emali: emali || user.emali,
        moblie_no: moblie_no || user.moblie_no,
        address: address || user.address,
        pincode: pincode || user.pincode,
        otp_code: null,
        otp_expiry: null
      }, { where: { user_id } });

      const updatedUser = await User.findByPk(user_id);
      return res.status(200).json({
        message: 'Email verified and profile updated successfully!',
        email_changed: true,
        user: {
          user_id: updatedUser.user_id,
          username: updatedUser.username,
          emali: updatedUser.emali,
          moblie_no: updatedUser.moblie_no,
          address: updatedUser.address,
          pincode: updatedUser.pincode,
          role: updatedUser.role
        }
      });
    }

    const emailHasChanged = emali && emali !== user.emali;

    if (emailHasChanged) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`\n[OTP GENERATED] Code for email change ${emali}: ${generatedOtp}\n`);

      await User.update({
        username: username || user.username,
        moblie_no: moblie_no || user.moblie_no,
        address: address || user.address,
        pincode: pincode || user.pincode,
        otp_code: generatedOtp,
        otp_expiry: new Date(Date.now() + 10 * 60 * 1000)
      }, { where: { user_id } });

      try {
        if (transporter) {
          await transporter.sendMail({
            from: `"Dharti Oil App" <${process.env.EMAIL_USER}>`,
            to: emali,
            subject: 'Verify Your New Email - Dharti Oil',
            html: `<p>Your verification code is: <strong>${generatedOtp}</strong></p><p>This code will expire in 10 minutes.</p>`
          });
        }
      } catch (emailError) {
        console.error('⚠️ Failed to send OTP:', emailError.message);
      }

      return res.status(200).json({
        message: 'Profile updated. OTP sent to verify new email.',
        email_changed: true,
        new_email: emali
      });
    } else {
      await User.update({
        username: username || user.username,
        moblie_no: moblie_no || user.moblie_no,
        address: address || user.address,
        pincode: pincode || user.pincode
      }, { where: { user_id } });

      const updatedUser = await User.findByPk(user_id);
      return res.status(200).json({
        message: 'Profile updated successfully!',
        email_changed: false,
        user: {
          user_id: updatedUser.user_id,
          username: updatedUser.username,
          emali: updatedUser.emali,
          moblie_no: updatedUser.moblie_no,
          address: updatedUser.address,
          pincode: updatedUser.pincode,
          role: updatedUser.role
        }
      });
    }
  } catch (error) {
    console.error(' Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET all users (admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['user_id', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update user role (admin)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'broker', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.update({ role }, { where: { user_id: id } });
    res.json({ message: `User role successfully updated to ${role}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  resendOtp,
  verifyOtp,
  loginUser,
  getUserById,
  getUserProfile,
  updateUserProfile,
  verifyUserEmail,
  changePassword,
  forgotPasswordSendOtp,
  forgotPasswordReset,
  sendOtpForEmailChange,
  verifyOtpForEmailChange,
  updateProfile,
  getAllUsers,
  updateUserRole
};
