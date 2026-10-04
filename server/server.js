const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { syncDatabase, sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

// Import Routes
const configRoutes = require('./routes/configRoutes');
const productRoutes = require('./routes/productRoutes');
const navbarRoutes = require('./routes/navbarRoutes');
const shopRoutes = require('./routes/shopRoutes');
const footerRoutes = require('./routes/footerRoutes');
const userRoutes = require('./routes/userRoutes');
const brokerRoutes = require('./routes/brokerRoutes');
const globalPriceRoutes = require('./routes/globalPriceRoutes');
const sellingRequestRoutes = require('./routes/sellingRequestRoutes');
const blogRoutes = require('./routes/blogRoutes');
const contactRoutes = require('./routes/contactRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const aboutUsRoutes = require('./routes/aboutUsRoutes');
const oilCakeRoutes = require('./routes/oilCakeRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== HELPER: Ensure FK on selling_requests =====
async function ensureSellingRequestBrokerFk() {
  try {
    const [constraints] = await sequelize.query(`
      SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'selling_requests'
        AND COLUMN_NAME = 'broker_id'
    `);

    for (const row of constraints) {
      if (row.CONSTRAINT_NAME) {
        await sequelize.query(`ALTER TABLE selling_requests DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\``);
      }
    }
  } catch (error) {
    console.warn('Could not drop existing selling_requests.broker_id FK:', error.message);
  }

  try {
    await sequelize.query(`
      ALTER TABLE selling_requests
      ADD CONSTRAINT fk_selling_requests_broker_id_register
      FOREIGN KEY (broker_id) REFERENCES register(user_id)
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `);
    console.log(' selling_requests.broker_id now references register.user_id');
  } catch (error) {
    console.warn('Could not create FK to register.user_id:', error.message);
  }
}

// ===== DATABASE SYNC =====
(async () => {
  await syncDatabase();
  await ensureSellingRequestBrokerFk();
  require('./migrate-all.js');
})();

// ===== ROUTES =====
app.get('/', (req, res) => {
  res.send('Dharti Oil Backend API is running!');
});

app.use('/api/config', configRoutes);
app.use('/api/products', productRoutes);
app.use('/api/navbar', navbarRoutes);
app.use('/api/shop-details', shopRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api', userRoutes);
app.use('/api', brokerRoutes);
app.use('/api', globalPriceRoutes);
app.use('/api', sellingRequestRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api', contactRoutes);
app.use('/api', deliveryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/about-us', aboutUsRoutes);
app.use('/api/oil-cake', oilCakeRoutes);
app.use('/api/invoice-settings', invoiceRoutes);

// ===== ERROR HANDLER (must be last) =====
app.use(errorHandler);

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
console.log(`Using PORT: ${PORT}`);
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(` Port ${PORT} is already in use by another process.`);
    console.error(`To release port ${PORT} on Windows PowerShell, run:`);
    console.error(`Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

