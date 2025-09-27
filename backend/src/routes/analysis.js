const express = require('express');
const jwt = require('jsonwebtoken');
const { Analysis, Project, User, Conversation } = require('../models');
const aiService = require('../services/aiService');
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

// @route   POST /api/analysis/project
// @desc    Proje analizi yap
// @access  Private
router.post('/project', authenticateToken, async (req, res) => {
  try {
    const { projectId, title, description, sector, budget, conversationId, useAI = false } = req.body;
    
    let project;
    
    // Eğer projectId verilmişse mevcut projeyi kullan
    if (projectId) {
      project = await Project.findOne({
        where: { 
          id: projectId,
          user_id: req.userId 
        }
      });
      
      if (!project) {
        return res.status(404).json({ error: 'Proje bulunamadı' });
      }
    } else {
      // Başlık ve açıklama kontrolü
      if (!title || !description) {
        return res.status(400).json({ 
          error: 'Başlık ve açıklama gerekli',
          required_fields: ['title', 'description']
        });
      }
    }

    const startTime = Date.now();

    // Analiz verilerini hazırla
    const projectTitle = project?.title || title;
    const projectDescription = project?.description || description;
    const projectSector = project?.sector || sector;
    const projectBudget = project?.budget || (budget ? parseFloat(budget) : null);

    // Basit analiz algoritması
    let overallScore = 30; // Base score
    let innovationScore = 50;
    let feasibilityScore = 60;
    let marketPotentialScore = 55;
    let technicalReadinessScore = 45;
    
    let suitablePrograms = [];
    let recommendations = [];
    let strengths = [];
    let weaknesses = [];
    let riskFactors = [];
    let improvementSuggestions = [];

    // Sektör analizi
    if (projectSector) {
      const sectorLower = projectSector.toLowerCase();
      
      if (sectorLower.includes('enerji')) {
        suitablePrograms.push('EPDK Ar-Ge Destek Programı', 'TÜBİTAK 1001');
        overallScore += 15;
        strengths.push('Enerji sektörü devlet destekli öncelikli alan');
        marketPotentialScore += 10;
      }
      
      if (sectorLower.includes('teknoloji') || sectorLower.includes('yazılım') || sectorLower.includes('ai')) {
        suitablePrograms.push('TÜBİTAK 1511', 'KOSGEB Ar-Ge Destek Programı');
        overallScore += 20;
        innovationScore += 15;
        strengths.push('Teknoloji sektörü yüksek inovasyon potansiyeli');
      }
      
      if (sectorLower.includes('sağlık') || sectorLower.includes('tıp')) {
        suitablePrograms.push('TÜBİTAK 1003', 'Sağlık Bakanlığı AR-GE');
        overallScore += 18;
        marketPotentialScore += 15;
        strengths.push('Sağlık sektörü toplumsal fayda potansiyeli yüksek');
      }
    }

    // Açıklama analizi
    const descriptionLower = projectDescription.toLowerCase();
    
    if (descriptionLower.length > 100) {
      overallScore += 10;
      feasibilityScore += 10;
    } else {
      recommendations.push('Proje açıklamasını daha detaylandırın');
      weaknesses.push('Proje açıklaması çok kısa');
    }

    // Yenilik/İnovasyon kontrolü
    const innovationKeywords = ['yenilik', 'inovasyon', 'innovation', 'yapay zeka', 'ai', 'machine learning', 'blockchain', 'iot'];
    const hasInnovation = innovationKeywords.some(keyword => descriptionLower.includes(keyword));
    
    if (hasInnovation) {
      overallScore += 15;
      innovationScore += 20;
      strengths.push('Projede yenilikçi teknolojiler kullanılıyor');
    } else {
      recommendations.push('Projenizin yenilik boyutunu daha net vurgulayın');
      improvementSuggestions.push('Mevcut çözümlerden farkınızı açık şekilde belirtin');
    }

    // Bütçe analizi
    if (projectBudget) {
      if (projectBudget >= 100000 && projectBudget <= 2000000) {
        overallScore += 15;
        feasibilityScore += 15;
        strengths.push('Bütçe TÜBİTAK program limitleri içinde');
      } else if (projectBudget > 2000000) {
        recommendations.push('Bütçeyi TÜBİTAK limitlerine uygun şekilde bölebilirsiniz');
        riskFactors.push('Yüksek bütçe program limitlerini aşıyor');
      } else {
        recommendations.push('Proje kapsamını genişleterek bütçeyi artırabilirsiniz');
        weaknesses.push('Düşük bütçe proje kapsamını sınırlayabilir');
      }
    }

    // Pazar potansiyeli analizi
    const marketKeywords = ['pazar', 'market', 'satış', 'müşteri', 'kullanıcı', 'endüstri'];
    const hasMarketFocus = marketKeywords.some(keyword => descriptionLower.includes(keyword));
    
    if (hasMarketFocus) {
      marketPotentialScore += 15;
      strengths.push('Proje pazar odaklı yaklaşım sergiliyor');
    } else {
      improvementSuggestions.push('Hedef pazar ve müşteri segmentini netleştirin');
    }

    // Teknik hazırlık analizi
    const techKeywords = ['prototip', 'prototype', 'test', 'geliştirme', 'yazılım', 'donanım'];
    const hasTechReadiness = techKeywords.some(keyword => descriptionLower.includes(keyword));
    
    if (hasTechReadiness) {
      technicalReadinessScore += 20;
      strengths.push('Teknik geliştirme süreci planlanmış');
    } else {
      improvementSuggestions.push('Teknik geliştirme aşamalarını detaylandırın');
    }

    // Risk faktörleri
    if (!suitablePrograms.length) {
      riskFactors.push('Uygun hibe programı tespit edilemedi');
      recommendations.push('Proje sektörünü daha net belirtin');
    }

    // AI analizi seçeneği
    let aiAnalysisData = null;
    if (useAI) {
      try {
        console.log('AI analizi başlatılıyor...');
        const aiAnalysis = await aiService.analyzeProjectWithAI({
          title: projectTitle,
          description: projectDescription,
          sector: projectSector,
          budget: projectBudget
        });
        
        console.log('AI analizi tamamlandı:', aiAnalysis);
        
        // AI sonuçlarını mevcut analizle birleştir
        if (aiAnalysis.innovation_score) {
          innovationScore = Math.max(innovationScore, aiAnalysis.innovation_score * 10);
        }
        
        if (aiAnalysis.suitable_programs && aiAnalysis.suitable_programs.length > 0) {
          suitablePrograms.push(...aiAnalysis.suitable_programs.filter(p => p && !suitablePrograms.includes(p)));
        }
        
        if (aiAnalysis.strengths && aiAnalysis.strengths.length > 0) {
          strengths.push(...aiAnalysis.strengths.filter(s => s));
        }
        
        if (aiAnalysis.improvements && aiAnalysis.improvements.length > 0) {
          improvementSuggestions.push(...aiAnalysis.improvements.filter(i => i));
        }
        
        // AI verisini kaydet
        aiAnalysisData = aiAnalysis;
        
      } catch (aiError) {
        console.log('AI analizi başarısız, rule-based devam ediyor:', aiError.message);
        recommendations.push('AI analizi kullanılamadı, temel analiz yapıldı');
      }
    }

    // Skorları normalize et
    overallScore = Math.min(overallScore, 100);
    innovationScore = Math.min(innovationScore, 100);
    feasibilityScore = Math.min(feasibilityScore, 100);
    marketPotentialScore = Math.min(marketPotentialScore, 100);
    technicalReadinessScore = Math.min(technicalReadinessScore, 100);

    const estimatedSuccessRate = overallScore;
    const confidenceLevel = overallScore > 70 ? 'high' : overallScore > 50 ? 'medium' : 'low';

    // Genel öneriler
    if (overallScore < 60) {
      improvementSuggestions.push('Proje kapsamını genişletin ve detaylandırın');
      improvementSuggestions.push('Yenilik boyutunu güçlendirin');
    }

    if (recommendations.length === 0) {
      recommendations.push('Proje güçlü görünüyor, başvuru aşamasına geçebilirsiniz');
    }

    const processingTime = Date.now() - startTime;

    // Analiz sonuçlarını veritabanına kaydet
    const analysisData = {
      project_id: project?.id || null,
      conversation_id: conversationId || null,
      analysis_type: 'project_evaluation',
      overall_score: overallScore,
      innovation_score: innovationScore,
      feasibility_score: feasibilityScore,
      market_potential_score: marketPotentialScore,
      technical_readiness_score: technicalReadinessScore,
      suitable_programs: suitablePrograms,
      recommendations,
      strengths,
      weaknesses,
      risk_factors: riskFactors,
      improvement_suggestions: improvementSuggestions,
      estimated_success_rate: estimatedSuccessRate,
      confidence_level: confidenceLevel,
      analysis_duration_ms: processingTime,
      ai_model_used: aiAnalysisData ? 'llama3.2:3b' : 'rule_based_v1',
      status: 'completed',
      metadata: {
        project_title: projectTitle,
        analyzed_fields: {
          title: !!projectTitle,
          description: !!projectDescription,
          sector: !!projectSector,
          budget: !!projectBudget
        }
      }
    };

    // Eğer proje yoksa, analiz verileri metadata'da saklanır
    if (!project) {
      analysisData.metadata.temp_project_data = {
        title: projectTitle,
        description: projectDescription,
        sector: projectSector,
        budget: projectBudget
      };
    }

    // AI analiz verisi varsa metadata'ya ekle
    if (aiAnalysisData) {
      analysisData.metadata.ai_analysis = aiAnalysisData;
    }

    const analysis = await Analysis.create(analysisData);

    // Response'u hazırla
    const responseData = {
      analysis_id: analysis.id,
      overall_score: overallScore,
      scores: {
        innovation: innovationScore,
        feasibility: feasibilityScore,
        market_potential: marketPotentialScore,
        technical_readiness: technicalReadinessScore
      },
      suitable_programs: suitablePrograms,
      recommendations,
      strengths,
      weaknesses,
      risk_factors: riskFactors,
      improvement_suggestions: improvementSuggestions,
      estimated_success_rate: estimatedSuccessRate,
      confidence_level: confidenceLevel,
      processing_time_ms: processingTime,
      analysis_date: analysis.createdAt,
      project_summary: {
        title: projectTitle,
        sector: projectSector,
        budget: projectBudget
      }
    };

    // AI verisi varsa ekle
    if (aiAnalysisData) {
      responseData.ai_analysis = aiAnalysisData;
      responseData.analysis_method = 'hybrid_ai_rule_based';
    } else {
      responseData.analysis_method = 'rule_based';
    }

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Project analysis error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// @route   GET /api/analysis/project/:projectId
// @desc    Proje analizlerini getir
// @access  Private
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { 
        id: req.params.projectId,
        user_id: req.userId 
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }

    const analyses = await Analysis.findAll({
      where: { project_id: project.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        project: {
          id: project.id,
          title: project.title,
          sector: project.sector
        },
        analyses,
        total_analyses: analyses.length
      }
    });

  } catch (error) {
    console.error('Get project analyses error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;