const { ContactDetails, ContactInquiry, User } = require('../models');
const path = require('path');
const fs = require('fs');

// GET contact details (public)
const getContactDetails = async (req, res) => {
  try {
    const contact = await ContactDetails.findOne();
    if (contact) {
      res.json(contact.toJSON());
    } else {
      res.status(404).json({ message: 'Contact details not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST update contact details (admin)
const updateContactDetails = async (req, res) => {
  try {
    const { address, email, mobile, facebook_link, instagram_link, youtube_link, existing_image } = req.body;

    const banner_image = req.file ? ('http://localhost:5000/uploads/contact/' + req.file.filename) : (existing_image || null);

    const existingContact = await ContactDetails.findOne();
    if (existingContact) {
      if (req.file && existingContact.banner_image && existingContact.banner_image.includes('/uploads/')) {
        const oldFilename = existingContact.banner_image.split('/').pop();
        const oldFilepath = path.join(__dirname, '..', 'uploads', 'contact', oldFilename);
        if (fs.existsSync(oldFilepath)) fs.unlinkSync(oldFilepath);
      }

      await ContactDetails.update({
        address, email, mobile, facebook_link, instagram_link, youtube_link, banner_image
      }, {
        where: { id: existingContact.id }
      });
      res.json({ message: 'Contact details updated successfully' });
    } else {
      await ContactDetails.create({
        address, email, mobile, facebook_link, instagram_link, youtube_link, banner_image
      });
      res.status(201).json({ message: 'Contact details created successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST submit contact inquiry (user)
const submitContactInquiry = async (req, res) => {
  try {
    const { first_name, last_name, phone, email, message, user_id } = req.body;

    if (!first_name || !last_name || !phone || !email || !user_id) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const inquiry = await ContactInquiry.create({
      first_name, last_name, phone, email, message, user_id
    });

    res.status(201).json({ message: 'Inquiry submitted successfully', inquiry_id: inquiry.id });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET all contact inquiries (admin)
const getAdminContactInquiries = async (req, res) => {
  try {
    const inquiries = await ContactInquiry.findAll({
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['user_id', 'username'] }]
    });
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getContactDetails, updateContactDetails, submitContactInquiry, getAdminContactInquiries };
