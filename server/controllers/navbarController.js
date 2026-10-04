const { Navbar } = require('../models');
const path = require('path');
const fs = require('fs');

// GET navbar data
const getNavbar = async (req, res) => {
  try {
    const navbar = await Navbar.findOne();
    if (navbar) {
      res.json(navbar.toJSON());
    } else {
      res.status(404).json({ message: 'Navbar data not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST delete navbar images
const deleteNavbarImages = async (req, res) => {
  try {
    const { fields } = req.body;
    if (!fields || !fields.length) return res.status(400).json({ message: 'No fields provided' });

    const navbar = await Navbar.findOne();
    if (!navbar) return res.status(404).json({ message: 'Navbar data not found' });

    const updates = {};

    for (const field of fields) {
      const allowedFields = ['nav_logo_path', 'I1_path', 'I2_path', 'I3_path', 'I4_path', 'I5_path', 'intro_path'];
      if (allowedFields.includes(field)) {
        updates[field] = null;
        if (navbar[field]) {
          const filename = navbar[field].split('/').pop();
          const filepath = path.join(__dirname, '..', 'uploads', 'navbar', filename);
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await Navbar.update(updates, { where: { nav_id: navbar.nav_id } });
    }

    res.json({ message: 'Images deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST update navbar data
const updateNavbar = async (req, res) => {
  try {
    const existingNavbar = await Navbar.findOne();

    const constructPath = (field) => {
      if (req.files && req.files[field]) {
        if (existingNavbar && existingNavbar[field]) {
          const filename = existingNavbar[field].split('/').pop();
          const filepath = path.join(__dirname, '..', 'uploads', 'navbar', filename);
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        }
        return 'http://localhost:5000/uploads/navbar/' + req.files[field][0].filename;
      }
      return req.body[field] || null;
    };

    const nav_logo_path = constructPath('nav_logo_path');
    const I1_path = constructPath('I1_path');
    const I2_path = constructPath('I2_path');
    const I3_path = constructPath('I3_path');
    const I4_path = constructPath('I4_path');
    const I5_path = constructPath('I5_path');
    const intro_path = constructPath('intro_path');

    if (existingNavbar) {
      await Navbar.update({
        nav_logo_path, I1_path, I2_path, I3_path, I4_path, I5_path, intro_path
      }, {
        where: { nav_id: existingNavbar.nav_id }
      });
      res.json({ message: 'Navbar updated successfully', nav_id: existingNavbar.nav_id });
    } else {
      const newNavbar = await Navbar.create({
        nav_logo_path, I1_path, I2_path, I3_path, I4_path, I5_path, intro_path
      });
      res.json({ message: 'Navbar created successfully', nav_id: newNavbar.nav_id });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getNavbar, deleteNavbarImages, updateNavbar };
