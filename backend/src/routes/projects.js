const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Project, User, Analysis } = require('../models');
const router = express.Router();

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token gerekli' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token süresi dolmuş' });
    }
    return res.status(401).json({ error: 'Geçersiz token' });
  }
};

// @route   GET /api/projects
// @desc    Kullanıcının projelerini getir
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, sector, status, search } = req.query;
    const offset = (page - 1) * limit;

    // Filtreleme koşulları
    const whereConditions = { user_id: req.userId };
    
    if (sector) {
      whereConditions.sector = sector;
    }
    
    if (status) {
      whereConditions.status = status;
    }

    const projects = await Project.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: projects.rows,
      pagination: {
        total: projects.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(projects.count / limit)
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// @route   POST /api/projects
// @desc    Yeni proje oluştur
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      sector,
      budget,
      project_stage = 'fikir',
      target_programs = [],
      keywords = [],
      team_size,
      duration_months
    } = req.body;

    // Validasyon
    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Başlık ve açıklama gerekli'
      });
    }

    // Proje verilerini hazırla
    const projectData = {
      user_id: req.userId,
      title: title.trim(),
      description: description.trim(),
      sector: sector?.trim() || null,
      budget: budget ? parseFloat(budget) : null,
      project_stage,
      target_programs: Array.isArray(target_programs) ? target_programs : [],
      keywords: Array.isArray(keywords) ? keywords : [],
      team_size: team_size ? parseInt(team_size) : null,
      duration_months: duration_months ? parseInt(duration_months) : null,
      status: 'draft'
    };

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      message: 'Proje başarıyla oluşturuldu',
      data: project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;