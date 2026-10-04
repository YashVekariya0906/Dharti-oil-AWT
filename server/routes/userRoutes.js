const express = require('express');
const router = express.Router();
const {
  registerUser, resendOtp, verifyOtp, loginUser,
  getUserById, getUserProfile, updateUserProfile, verifyUserEmail,
  changePassword, forgotPasswordSendOtp, forgotPasswordReset,
  sendOtpForEmailChange, verifyOtpForEmailChange, updateProfile,
  getAllUsers, updateUserRole
} = require('../controllers/userController');

// POST /api/register
router.post('/register', registerUser);

// POST /api/resend-otp
router.post('/resend-otp', resendOtp);

// POST /api/verify-otp
router.post('/verify-otp', verifyOtp);

// POST /api/login
router.post('/login', loginUser);

// GET /api/users/:id
router.get('/users/:id', getUserById);

// GET /api/users/:id/profile
router.get('/users/:id/profile', getUserProfile);

// PUT /api/users/:id/profile
router.put('/users/:id/profile', updateUserProfile);

// POST /api/users/:id/verify-email
router.post('/users/:id/verify-email', verifyUserEmail);

// PUT /api/users/:id/change-password
router.put('/users/:id/change-password', changePassword);

// POST /api/forgot-password/send-otp
router.post('/forgot-password/send-otp', forgotPasswordSendOtp);

// POST /api/forgot-password/reset
router.post('/forgot-password/reset', forgotPasswordReset);

// POST /api/users/send-otp
router.post('/users/send-otp', sendOtpForEmailChange);

// POST /api/users/verify-otp
router.post('/users/verify-otp', verifyOtpForEmailChange);

// PUT /api/users/profile
router.put('/users/profile', updateProfile);

// GET /api/admin/users
router.get('/admin/users', getAllUsers);

// PUT /api/admin/users/:id/role
router.put('/admin/users/:id/role', updateUserRole);

module.exports = router;
