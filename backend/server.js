const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('./config/database');
const { syncDatabase } = require('./src/models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const initializeData = async () => {
  try {
    // Doğru import yolu
    const seedData = require('./src/seedData');
    if (seedData && typeof seedData.seedGrantPrograms === 'function') {
      await seedData.seedGrantPrograms();
    } else {
      console.log('❌ seedGrantPrograms fonksiyonu bulunamadı');
    }
  } catch (error) {
    console.error('Seed verisi yükleme hatası:', error);
  }
};

// Middleware
app.use(helmet()); // Güvenlik headers
app.use(cors()); // CORS politikası
app.use(morgan('combined')); // Request logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/projects', require('./src/routes/projects'));
app.use('/api/chat', require('./src/routes/chat'));
app.use('/api/analysis', require('./src/routes/analysis'));
app.use('/api/tubitak', require('./src/routes/tubitak'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'TÜBİTAK-EPDK Asistan API çalışıyor',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Sunucu hatası!', 
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı!' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
  console.log(`🔗 API: http://localhost:${PORT}`);
  console.log(`⚡ Health check: http://localhost:${PORT}/health`);
  
  // Veritabanı bağlantısını test et
  await testConnection();
  
  // Veritabanı senkronizasyonu
  await syncDatabase(true); // force: true - dikkatli ol!
  
  // Seed verilerini yükle
  await initializeData();
});