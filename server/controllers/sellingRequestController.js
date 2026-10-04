const { SellingRequest, User, GlobalPrice } = require('../models');

// POST create selling request (user)
const createSellingRequest = async (req, res) => {
  try {
    const { user_id, stock_per_mound, customer_price, payment_method } = req.body;
    const globalPrice = await GlobalPrice.findOne();
    const our_price = globalPrice ? globalPrice.current_price : 0;

    const request = await SellingRequest.create({
      user_id, stock_per_mound, our_price, customer_price, payment_method: payment_method || 'Cash'
    });
    res.status(201).json({ message: 'Selling Request created successfully!', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET all selling requests (admin)
const getAdminSellingRequests = async (req, res) => {
  try {
    const requests = await SellingRequest.findAll({
      include: [
        { model: User, as: 'user' },
        { model: User, as: 'broker' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET all selling requests with full details (admin)
const getAdminSellingRequestsFull = async (req, res) => {
  try {
    const requests = await SellingRequest.findAll({
      include: [
        { model: User, as: 'user' },
        { model: User, as: 'broker' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching selling requests:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT accept selling request and assign broker (admin)
const acceptSellingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { broker_id } = req.body;

    await SellingRequest.update({ broker_id, status: 'Accepted' }, { where: { request_id: id } });
    res.json({ message: 'Selling request accepted and broker assigned.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT reject selling request (admin)
const rejectSellingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_reject_reason, admin_reject_comment } = req.body;

    if (!admin_reject_reason) {
      return res.status(400).json({ message: 'Rejection reason is required.' });
    }

    const request = await SellingRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Selling request not found.' });

    await SellingRequest.update({
      status: 'AdminRejected',
      admin_reject_reason,
      admin_reject_comment: admin_reject_comment || ''
    }, { where: { request_id: id } });

    res.json({ message: 'Selling request rejected by admin.' });
  } catch (error) {
    console.error('Error rejecting selling request:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT confirm broker rejection (admin)
const confirmBrokerRejection = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await SellingRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Selling request not found.' });

    await SellingRequest.update({
      status: 'BrokerRejectionConfirmed'
    }, { where: { request_id: id } });

    res.json({ message: 'Broker rejection confirmed and forwarded to user.' });
  } catch (error) {
    console.error('Error confirming broker rejection:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT override broker rejection (admin)
const overrideBrokerRejection = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await SellingRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Selling request not found.' });

    await SellingRequest.update({
      status: 'Pending',
      broker_id: null,
      broker_reject_reason: null,
      broker_reject_comment: null,
      broker_reject_photos: null,
      visit_day: null,
      visit_time: null,
      reached_at: null
    }, { where: { request_id: id } });

    res.json({ message: 'Request reset. You can now assign another broker.' });
  } catch (error) {
    console.error('Error overriding broker rejection:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET broker selling requests
const getBrokerSellingRequests = async (req, res) => {
  try {
    const { broker_id } = req.params;
    const requests = await SellingRequest.findAll({
      where: { broker_id },
      include: [{ model: User, as: 'user' }],
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT schedule visit (broker)
const scheduleVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { visit_day, visit_time } = req.body;

    await SellingRequest.update({ visit_day, visit_time, status: 'Scheduled' }, { where: { request_id: id } });
    res.json({ message: 'Visit scheduled successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT mark as reached (broker)
const markAsReached = async (req, res) => {
  try {
    const { id } = req.params;
    await SellingRequest.update({ status: 'Reached', reached_at: new Date() }, { where: { request_id: id } });
    res.json({ message: 'Marked as Reached successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT submit visit report (broker)
const submitReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { delivered_quantity, broker_comments, final_price } = req.body;

    const request = await SellingRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Selling request not found' });
    }

    let samplePhotos = [];
    if (request.sample_photos) {
      try {
        samplePhotos = JSON.parse(request.sample_photos);
      } catch (e) {
        samplePhotos = [];
      }
    }

    if (req.files && req.files.sample_photos) {
      const newPhotos = req.files.sample_photos.map(file => 'http://localhost:5000/uploads/reports/' + file.filename);
      samplePhotos = [...samplePhotos, ...newPhotos];
    }

    let paymentProofUrl = request.payment_proof || null;
    if (req.files && req.files.payment_proof && req.files.payment_proof.length > 0) {
      paymentProofUrl = 'http://localhost:5000/uploads/reports/' + req.files.payment_proof[0].filename;
    }

    await SellingRequest.update({
      delivered_quantity: delivered_quantity != null ? parseFloat(delivered_quantity) : request.delivered_quantity,
      broker_comments: broker_comments != null ? broker_comments : request.broker_comments,
      final_price: final_price != null ? parseFloat(final_price) : request.final_price,
      sample_photos: JSON.stringify(samplePhotos),
      payment_proof: paymentProofUrl,
      is_visited: true,
      status: 'Completed'
    }, { where: { request_id: id } });

    res.json({ message: 'Visit report submitted successfully.' });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT broker reject (broker)
const brokerReject = async (req, res) => {
  try {
    const { id } = req.params;
    const { broker_reject_reason, broker_reject_comment } = req.body;

    if (!broker_reject_reason) {
      return res.status(400).json({ message: 'Rejection reason is required.' });
    }

    const request = await SellingRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Selling request not found.' });

    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map(f => 'http://localhost:5000/uploads/broker/' + f.filename);
    }

    await SellingRequest.update({
      status: 'BrokerRejected',
      broker_reject_reason,
      broker_reject_comment: broker_reject_comment || '',
      broker_reject_photos: JSON.stringify(photos)
    }, { where: { request_id: id } });

    res.json({ message: 'Broker rejection submitted. Awaiting admin review.' });
  } catch (error) {
    console.error('Error submitting broker rejection:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET user selling requests
const getUserSellingRequests = async (req, res) => {
  try {
    const { id } = req.params;
    const requests = await SellingRequest.findAll({
      where: { user_id: id },
      include: [{ model: User, as: 'broker' }],
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching user selling requests:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
};
