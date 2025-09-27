const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Kullanıcı kaydı
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, name, company, sector, phone } = req.body;
    
    // Validasyon
    if (!email || !name) {
      return res.status(400).json({ 
        error: 'Email ve isim gerekli',
        required_fields: ['email', 'name']
      });
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir email adresi girin' });
    }

    // İsim uzunluğu kontrolü
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'İsim 2-100 karakter arasında olmalı' });
    }

    // Kullanıcının zaten var olup olmadığını kontrol et
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Bu email adresi zaten kayıtlı' });
    }

    // Yeni kullanıcı oluştur
    const userData = {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      company: company?.trim() || null,
      sector: sector?.trim() || null,
      phone: phone?.trim() || null,
      is_active: true,
      preferences: {
        notifications: true,
        language: 'tr',
        theme: 'light'
      }
    };

    const user = await User.create(userData);

    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Kullanıcı verilerini temizle (hassas bilgileri çıkar)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      sector: user.sector,
      phone: user.phone,
      is_active: user.is_active,
      preferences: user.preferences,
      created_at: user.created_at
    };

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla kaydedildi',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    
    // Sequelize validasyon hataları
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validasyon hatası',
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// @route   POST /api/auth/login
// @desc    Kullanıcı girişi
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email gerekli' });
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir email adresi girin' });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ 
      where: { 
        email: email.toLowerCase().trim(),
        is_active: true 
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı veya aktif değil' });
    }

    // Son giriş zamanını güncelle
    await user.update({ last_login: new Date() });

    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Kullanıcı verilerini temizle
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      sector: user.sector,
      phone: user.phone,
      preferences: user.preferences,
      last_login: user.last_login
    };

    res.json({
      success: true,
      message: 'Giriş başarılı',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// @route   GET /api/auth/me
// @desc    Kullanıcı profilini getir
// @access  Private (JWT token gerekli)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token gerekli' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findOne({
      where: { 
        id: decoded.userId,
        is_active: true 
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Geçersiz token' });
    }

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      sector: user.sector,
      phone: user.phone,
      preferences: user.preferences,
      created_at: user.created_at,
      last_login: user.last_login
    };

    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Geçersiz token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token süresi dolmuş' });
    }

    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;