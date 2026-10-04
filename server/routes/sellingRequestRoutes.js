const express = require('express');
const router = express.Router();
const {
  createSellingRequest,
  getAdminSellingRequests,
  getAdminSellingRequestsFull,
  acceptSellingRequest,
  rejectSellingRequest,
  confirmBrokerRejection,
  overrideBrokerRejection,
  getBrokerSellingRequests,
  scheduleVisit,
  markAsReached,
  submitReport,
  brokerReject,
  getUserSellingRequests
} = require('../controllers/sellingRequestController');
const { reportUpload, brokerRejectUpload } = require('../config/multer');

// POST /api/users/selling-requests
router.post('/users/selling-requests', createSellingRequest);

// GET /api/admin/selling-requests
router.get('/admin/selling-requests', getAdminSellingRequests);

// GET /api/admin/selling-requests-full
router.get('/admin/selling-requests-full', getAdminSellingRequestsFull);

// PUT /api/admin/selling-requests/:id/accept
router.put('/admin/selling-requests/:id/accept', acceptSellingRequest);

// PUT /api/admin/selling-requests/:id/reject
router.put('/admin/selling-requests/:id/reject', rejectSellingRequest);

// PUT /api/admin/selling-requests/:id/confirm-broker-rejection
router.put('/admin/selling-requests/:id/confirm-broker-rejection', confirmBrokerRejection);

// PUT /api/admin/selling-requests/:id/override-broker-rejection
router.put('/admin/selling-requests/:id/override-broker-rejection', overrideBrokerRejection);

// GET /api/brokers/:broker_id/selling-requests
router.get('/brokers/:broker_id/selling-requests', getBrokerSellingRequests);

// PUT /api/brokers/selling-requests/:id/schedule
router.put('/brokers/selling-requests/:id/schedule', scheduleVisit);

// PUT /api/brokers/selling-requests/:id/reached
router.put('/brokers/selling-requests/:id/reached', markAsReached);

// PUT /api/brokers/selling-requests/:id/report
router.put('/brokers/selling-requests/:id/report',
  reportUpload.fields([{ name: 'sample_photos', maxCount: 5 }, { name: 'payment_proof', maxCount: 1 }]),
  submitReport
);

// PUT /api/brokers/selling-requests/:id/broker-reject
router.put('/brokers/selling-requests/:id/broker-reject',
  brokerRejectUpload.array('broker_reject_photos', 5),
  brokerReject
);

// GET /api/users/:id/selling-requests
router.get('/users/:id/selling-requests', getUserSellingRequests);

module.exports = router;
