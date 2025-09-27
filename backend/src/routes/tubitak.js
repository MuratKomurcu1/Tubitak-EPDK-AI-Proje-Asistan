const express = require('express');
const tubitakSearchService = require('../services/tubitakSearchService');
const router = express.Router();

// @route   GET /api/tubitak/search
// @desc    TÜBİTAK projelerinde arama
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Arama terimi en az 2 karakter olmalı' 
      });
    }
    
    const results = await tubitakSearchService.searchProjects(query, parseInt(limit));
    
    res.json({
      success: true,
      query,
      results,
      total: results.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('TÜBİTAK arama hatası:', error);
    res.status(500).json({ error: 'Arama işleminde hata oluştu' });
  }
});

// @route   POST /api/tubitak/similarity-check
// @desc    Proje benzerlik kontrolü
router.post('/similarity-check', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Proje başlığı ve açıklama gerekli' 
      });
    }
    
    const result = await tubitakSearchService.checkProjectSimilarity(title, description);
    
    res.json({
      success: true,
      project: { title, description },
      similarity_result: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Benzerlik kontrolü hatası:', error);
    res.status(500).json({ error: 'Benzerlik kontrolünde hata oluştu' });
  }
});

// @route   GET /api/tubitak/stats
// @desc    TÜBİTAK veritabanı istatistikleri
router.get('/stats', async (req, res) => {
  try {
    const stats = await tubitakSearchService.getStatistics();
    
    res.json({
      success: true,
      statistics: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({ error: 'İstatistik alınırken hata oluştu' });
  }
});

module.exports = router;