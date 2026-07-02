const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { initDB } = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');
const seedProducts = require('./utils/seedProducts');

dotenv.config({ path: './config/config.env' });

const app = express();

app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'medishop-backend', database: 'sqlite' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    initDB();
    await seedAdmin();
    await seedProducts();

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
// Trigger nodemon reload for db rebuild
