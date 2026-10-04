const { AboutUs, AboutUsMember } = require('../models');
const path = require('path');
const fs = require('fs');

// GET about us data
const getAboutUs = async (req, res) => {
  try {
    let aboutUs = await AboutUs.findOne();
    if (!aboutUs) {
      aboutUs = await AboutUs.create({
        company_intro: '',
        infra_title: 'Infrastructure',
        infra_description: '',
        mgmt_title: 'Management Behind Dharti Amrut',
        faq_data: '[]'
      });
    }
    const raw = aboutUs.toJSON();
    if (typeof raw.faq_data === 'string') {
      try { raw.faq_data = JSON.parse(raw.faq_data); } catch { raw.faq_data = []; }
    }
    res.json(raw);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST update about us (admin)
const updateAboutUs = async (req, res) => {
  try {
    let aboutUs = await AboutUs.findOne();
    let oldData = aboutUs ? aboutUs.toJSON() : null;

    const buildUrl = (fieldName) => {
      if (req.files && req.files[fieldName]) {
        if (oldData && oldData[fieldName] && typeof oldData[fieldName] === 'string' && oldData[fieldName].includes('/uploads/')) {
          const oldFilename = oldData[fieldName].split('/').pop();
          const oldFilepath = path.join(__dirname, '..', 'uploads', 'about', oldFilename);
          if (fs.existsSync(oldFilepath)) fs.unlinkSync(oldFilepath);
        }
        return 'http://localhost:5000/uploads/about/' + req.files[fieldName][0].filename;
      }
      return req.body[fieldName] || null;
    };

    const data = {
      company_intro: req.body.company_intro || '',
      about_banner_image: buildUrl('about_banner_image'),
      about_intro_image: buildUrl('about_intro_image'),
      infra_title: req.body.infra_title || 'Infrastructure',
      infra_description: req.body.infra_description || '',
      infra_image_1: buildUrl('infra_image_1'),
      infra_image_2: buildUrl('infra_image_2'),
      infra_image_3: buildUrl('infra_image_3'),
      infra_image_4: buildUrl('infra_image_4'),
      infra_image_5: buildUrl('infra_image_5'),
      infra_image_6: buildUrl('infra_image_6'),
      mgmt_title: req.body.mgmt_title || 'Management Behind Dharti Amrut',
      faq_data: req.body.faq_data || '[]'
    };

    if (aboutUs) {
      await AboutUs.update(data, { where: { id: aboutUs.id } });
      res.json({ message: 'About Us updated successfully' });
    } else {
      await AboutUs.create(data);
      res.json({ message: 'About Us created successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST delete a specific image field
const deleteAboutUsImage = async (req, res) => {
  try {
    const { field } = req.body;
    const allowed = ['about_banner_image', 'about_intro_image', 'infra_image_1', 'infra_image_2', 'infra_image_3', 'infra_image_4', 'infra_image_5', 'infra_image_6'];
    if (!allowed.includes(field)) return res.status(400).json({ message: 'Invalid field' });
    const aboutUsDoc = await AboutUs.findOne();
    if (!aboutUsDoc) return res.status(404).json({ message: 'Not found' });
    const aboutUs = aboutUsDoc.toJSON();
    if (aboutUs[field] && typeof aboutUs[field] === 'string' && aboutUs[field].includes('/uploads/')) {
      const filename = aboutUs[field].split('/').pop();
      const filepath = path.join(__dirname, '..', 'uploads', 'about', filename);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }
    await AboutUs.update({ [field]: null }, { where: { id: aboutUsDoc.id } });
    res.json({ message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET management members
const getMembers = async (req, res) => {
  try {
    const members = await AboutUsMember.findAll({ order: [['sort_order', 'ASC'], ['id', 'ASC']] });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST add management member
const addMember = async (req, res) => {
  try {
    const { name, designation, bio, sort_order } = req.body;
    if (!name || !designation) return res.status(400).json({ message: 'Name and designation are required' });
    const member_image = req.file ? 'http://localhost:5000/uploads/about/' + req.file.filename : null;
    const member = await AboutUsMember.create({
      name, designation, bio: bio || '', member_image,
      sort_order: sort_order ? parseInt(sort_order) : 0
    });
    res.status(201).json({ message: 'Member added', member });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update management member
const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, bio, sort_order, existing_image } = req.body;
    let member_image = existing_image || null;
    if (req.file) {
      const memberDoc = await AboutUsMember.findByPk(id);
      const member = memberDoc ? memberDoc.toJSON() : null;
      if (member && member.member_image && typeof member.member_image === 'string' && member.member_image.includes('/uploads/')) {
        const oldFilename = member.member_image.split('/').pop();
        const oldFilepath = path.join(__dirname, '..', 'uploads', 'about', oldFilename);
        if (fs.existsSync(oldFilepath)) fs.unlinkSync(oldFilepath);
      }
      member_image = 'http://localhost:5000/uploads/about/' + req.file.filename;
    }
    await AboutUsMember.update(
      { name, designation, bio: bio || '', member_image, sort_order: sort_order ? parseInt(sort_order) : 0 },
      { where: { id } }
    );
    res.json({ message: 'Member updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE management member
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const memberDoc = await AboutUsMember.findByPk(id);
    const member = memberDoc ? memberDoc.toJSON() : null;
    if (member && member.member_image && typeof member.member_image === 'string' && member.member_image.includes('/uploads/')) {
      const filename = member.member_image.split('/').pop();
      const filepath = path.join(__dirname, '..', 'uploads', 'about', filename);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }
    await AboutUsMember.destroy({ where: { id } });
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAboutUs, updateAboutUs, deleteAboutUsImage, getMembers, addMember, updateMember, deleteMember };
