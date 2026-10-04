const express = require('express');
const router = express.Router();
const { getAboutUs, updateAboutUs, deleteAboutUsImage, getMembers, addMember, updateMember, deleteMember } = require('../controllers/aboutUsController');
const { aboutUsUpload, aboutUsFields } = require('../config/multer');

// GET /api/about-us
router.get('/', getAboutUs);

// POST /api/about-us/update
router.post('/update', aboutUsUpload.fields(aboutUsFields), updateAboutUs);

// POST /api/about-us/delete-image
router.post('/delete-image', deleteAboutUsImage);

// GET /api/about-us/members
router.get('/members', getMembers);

// POST /api/about-us/members
router.post('/members', aboutUsUpload.single('member_image'), addMember);

// PUT /api/about-us/members/:id
router.put('/members/:id', aboutUsUpload.single('member_image'), updateMember);

// DELETE /api/about-us/members/:id
router.delete('/members/:id', deleteMember);

module.exports = router;
