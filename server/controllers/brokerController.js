const { User } = require('../models');
const bcrypt = require('bcrypt');
const transporter = require('../config/email');

// In-memory store for broker details waiting for OTP confirmation
const pendingBrokers = new Map();

// POST add broker (pre-registration with OTP)
const addBroker = async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const moblie_no = (req.body.moblie_no || '').trim();
    const address = (req.body.address || '').trim();
    const password = (req.body.password || '').trim();
    const emali = (req.body.emali || '').trim().toLowerCase();
    const pincode = (req.body.pincode || '').trim();
    const commission_percent = req.body.commission_percent;

    if (!username || !moblie_no || !address || !password || !emali || !pincode) {
      console.log(' Missing required fields:', { username, moblie_no, address, password, emali, pincode });
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingBroker = await User.findOne({ where: { emali, role: 'broker' } });
    if (existingBroker) {
      console.log(` Broker with email ${emali} already exists`);
      return res.status(409).json({ message: 'Broker with this email already exists!' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    pendingBrokers.set(emali, {
      username, moblie_no, address, pincode, emali,
      password: hashedPassword,
      commission_percent: commission_percent || 0,
      otpCode, otpExpiry
    });

    console.log(`📋 Broker [${emali}] stored in memory, waiting for OTP verification`);

    try {
      if (transporter) {
        await transporter.sendMail({
          from: `"Dharti Amrut" <${process.env.EMAIL_USER}>`,
          to: emali,
          subject: 'Broker Verification OTP - Dharti Amrut',
          html: `<p>Your broker account verification code is <strong>${otpCode}</strong>. This code expires in 10 minutes.</p>`
        });
      } else {
        console.log(`📧 [DEV MODE] OTP for ${emali} → ${otpCode}`);
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send broker OTP email:', emailError.message);
    }

    res.status(201).json({
      message: 'OTP sent to broker email. Verify OTP to complete broker registration.',
      emali
    });
  } catch (error) {
    console.error('Error during broker pre-registration:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET all brokers (admin)
const getAllBrokers = async (req, res) => {
  try {
    const brokers = await User.findAll({ where: { role: 'broker' }, order: [['user_id', 'DESC']] });
    res.json(brokers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE broker (admin)
const deleteBroker = async (req, res) => {
  try {
    const { id } = req.params;
    const broker = await User.findByPk(id);
    if (!broker || broker.role !== 'broker') {
      return res.status(404).json({ message: 'Broker not found' });
    }
    await User.destroy({ where: { user_id: id } });
    res.json({ message: 'Broker deleted successfully' });
  } catch (error) {
    console.error(' Error deleting broker:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST verify broker OTP and finalize registration
const verifyBrokerOtp = async (req, res) => {
  try {
    const { emali, otp_code } = req.body;
    if (!emali || !otp_code) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = (emali || '').trim().toLowerCase();
    const pending = pendingBrokers.get(normalizedEmail);

    if (!pending) {
      return res.status(400).json({ message: 'No pending registration found for this email. Please fill in the broker form again.' });
    }

    if (pending.otpCode !== (otp_code || '').trim()) {
      return res.status(400).json({ message: 'Invalid OTP code. Please try again.' });
    }

    if (Date.now() > pending.otpExpiry) {
      pendingBrokers.delete(normalizedEmail);
      return res.status(400).json({ message: 'OTP has expired. Please refill the broker form to get a new OTP.' });
    }

    const broker = await User.create({
      username: pending.username,
      moblie_no: pending.moblie_no,
      emali: pending.emali,
      address: pending.address,
      pincode: pending.pincode,
      password: pending.password,
      role: 'broker',
      commission_percent: pending.commission_percent,
      status: 'Active'
    });

    pendingBrokers.delete(normalizedEmail);

    console.log(`  Broker ${broker.username} (${broker.emali}) successfully added to DB after OTP verification.`);
    res.status(200).json({ message: 'Broker verified and added successfully!', broker });
  } catch (error) {
    console.error('Error verifying broker OTP:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT update broker (admin)
const updateBroker = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, moblie_no, address, pincode, commission_percent, status, password, emali } = req.body;

    const broker = await User.findByPk(id);
    if (!broker || broker.role !== 'broker') {
      return res.status(404).json({ message: 'Broker not found' });
    }

    const updates = {
      username: username ? username.trim() : broker.username,
      moblie_no: moblie_no ? moblie_no.trim() : broker.moblie_no,
      address: address ? address.trim() : broker.address,
      pincode: pincode ? pincode.trim() : broker.pincode,
      commission_percent: commission_percent != null ? commission_percent : broker.commission_percent,
      status: status || broker.status
    };

    if (emali) {
      updates.emali = emali.trim().toLowerCase();
    }

    if (password && password.trim()) {
      const saltRounds = 10;
      updates.password = await bcrypt.hash(password.trim(), saltRounds);
    }

    await User.update(updates, { where: { user_id: id } });

    const updatedBroker = await User.findByPk(id);
    res.status(200).json({ message: 'Broker updated successfully', broker: updatedBroker });
  } catch (error) {
    console.error(' Error updating broker:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET brokers by pincode
const getBrokersByPincode = async (req, res) => {
  try {
    const { pincode } = req.params;
    const brokers = await User.findAll({
      where: {
        pincode,
        role: 'broker',
        status: 'Active',
        otp_code: null
      },
      attributes: ['user_id', 'username', 'emali', 'moblie_no', 'address', 'pincode', 'commission_percent', 'status']
    });
    res.json(brokers);
  } catch (error) {
    console.error('Error fetching brokers:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addBroker,
  getAllBrokers,
  deleteBroker,
  verifyBrokerOtp,
  updateBroker,
  getBrokersByPincode
};
