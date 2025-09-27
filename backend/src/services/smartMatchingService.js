const GrantProgram = require('../models/GrantProgram');
const { Op } = require('sequelize');

class SmartMatchingService {
  
  /**
   * Proje bilgilerine göre en uygun hibe programlarını bulur
   */
  async findMatchingPrograms(projectData) {
    try {
      const {
        sector,
        budget,
        duration_months,
        project_stage,
        keywords = [],
        applicant_type = 'universiteler'
      } = projectData;

      // Aktif programları getir
      const activePrograms = await GrantProgram.findAll({
        where: {
          status: 'active',
          [Op.or]: [
            { is_continuous: true },
            {
              application_start_date: { [Op.lte]: new Date() },
              application_end_date: { [Op.gte]: new Date() }
            }
          ]
        }
      });

      // Her program için uygunluk skoru hesapla
      const scoredPrograms = activePrograms.map(program => {
        const score = this.calculateMatchScore(projectData, program);
        return {
          program,
          score,
          matchDetails: this.getMatchDetails(projectData, program)
        };
      });

      // Skora göre sırala ve en uygun 5'ini döndür
      return scoredPrograms
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(item => ({
          ...item.program.toJSON(),
          match_score: Math.round(item.score),
          match_details: item.matchDetails
        }));

    } catch (error) {
      console.error('Program eşleştirme hatası:', error);
      throw new Error('Program eşleştirme sırasında hata oluştu');
    }
  }

  /**
   * Proje ile program arasındaki uygunluk skorunu hesaplar (0-100)
   */
  calculateMatchScore(projectData, program) {
    let totalScore = 0;
    let maxScore = 0;

    // 1. Sektör uygunluğu (25 puan)
    const sectorScore = this.calculateSectorMatch(projectData.sector, program.target_sectors);
    totalScore += sectorScore * 0.25;
    maxScore += 25;

    // 2. Bütçe uygunluğu (20 puan)
    const budgetScore = this.calculateBudgetMatch(projectData.budget, program);
    totalScore += budgetScore * 0.20;
    maxScore += 20;

    // 3. Süre uygunluğu (15 puan)
    const durationScore = this.calculateDurationMatch(projectData.duration_months, program);
    totalScore += durationScore * 0.15;
    maxScore += 15;

    // 4. Başvuru sahibi uygunluğu (20 puan)
    const applicantScore = this.calculateApplicantMatch(projectData.applicant_type, program.eligible_applicants);
    totalScore += applicantScore * 0.20;
    maxScore += 20;

    // 5. Anahtar kelime uygunluğu (10 puan)
    const keywordScore = this.calculateKeywordMatch(projectData.keywords, program.keywords);
    totalScore += keywordScore * 0.10;
    maxScore += 10;

    // 6. Proje aşaması uygunluğu (10 puan)
    const stageScore = this.calculateStageMatch(projectData.project_stage, program);
    totalScore += stageScore * 0.10;
    maxScore += 10;

    return (totalScore / maxScore) * 100;
  }

  calculateSectorMatch(projectSector, targetSectors) {
    if (!projectSector || !targetSectors || targetSectors.length === 0) return 50;
    
    // Direkt eşleşme
    if (targetSectors.includes(projectSector)) return 100;
    
    // Benzer sektör eşleşmeleri
    const sectorMapping = {
      'teknoloji': ['yazilim', 'bilisim', 'ai', 'makine_ogrenmesi'],
      'saglik': ['biyoteknoloji', 'medikal', 'farma'],
      'enerji': ['yenilenebilir', 'elektrik', 'guc'],
      'imalat': ['uretim', 'endustri', 'otomotiv']
    };

    const relatedSectors = sectorMapping[projectSector] || [];
    const hasRelatedMatch = targetSectors.some(sector => 
      relatedSectors.some(related => sector.includes(related))
    );

    return hasRelatedMatch ? 70 : 30;
  }

  calculateBudgetMatch(projectBudget, program) {
    if (!projectBudget || !program.min_budget || !program.max_budget) return 70;

    if (projectBudget >= program.min_budget && projectBudget <= program.max_budget) {
      return 100;
    }

    // Bütçe aralığının dışında ama yakınsa
    const tolerance = (program.max_budget - program.min_budget) * 0.2;
    
    if (projectBudget < program.min_budget) {
      const difference = program.min_budget - projectBudget;
      return difference <= tolerance ? 70 : 30;
    } else {
      const difference = projectBudget - program.max_budget;
      return difference <= tolerance ? 70 : 20;
    }
  }

  calculateDurationMatch(projectDuration, program) {
    if (!projectDuration || !program.min_duration_months || !program.max_duration_months) return 70;

    if (projectDuration >= program.min_duration_months && projectDuration <= program.max_duration_months) {
      return 100;
    }

    // Süre aralığının dışında ama yakınsa
    const tolerance = 6; // 6 ay tolerans
    
    if (projectDuration < program.min_duration_months) {
      const difference = program.min_duration_months - projectDuration;
      return difference <= tolerance ? 70 : 40;
    } else {
      const difference = projectDuration - program.max_duration_months;
      return difference <= tolerance ? 70 : 40;
    }
  }

  calculateApplicantMatch(applicantType, eligibleApplicants) {
    if (!applicantType || !eligibleApplicants || eligibleApplicants.length === 0) return 70;

    // Direkt eşleşme
    if (eligibleApplicants.includes(applicantType)) return 100;

    // Benzer başvuru sahibi türleri
    const typeMapping = {
      'universiteler': ['akademik', 'egitim'],
      'sirketler': ['ozel_sektor', 'kobileri'],
      'arastirma_kurumlari': ['kamu', 'teknokent']
    };

    const relatedTypes = typeMapping[applicantType] || [];
    const hasRelatedMatch = eligibleApplicants.some(eligible => 
      relatedTypes.some(related => eligible.includes(related))
    );

    return hasRelatedMatch ? 80 : 30;
  }

  calculateKeywordMatch(projectKeywords, programKeywords) {
    if (!projectKeywords || !programKeywords || projectKeywords.length === 0 || programKeywords.length === 0) {
      return 50;
    }

    const matchingKeywords = projectKeywords.filter(keyword => 
      programKeywords.some(programKeyword => 
        programKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(programKeyword.toLowerCase())
      )
    );

    const matchRatio = matchingKeywords.length / projectKeywords.length;
    return Math.min(matchRatio * 100, 100);
  }

  calculateStageMatch(projectStage, program) {
    // Program tipine göre hangi aşamaların uygun olduğunu belirle
    const stageCompatibility = {
      'TUBITAK': {
        '1001': ['fikir', 'prototip', 'pilot'],
        '1511': ['prototip', 'pilot', 'urun'],
        '1003': ['fikir', 'prototip']
      },
      'EPDK': ['prototip', 'pilot', 'urun'],
      'KOSGEB': ['pilot', 'urun', 'pazar']
    };

    const suitableStages = stageCompatibility[program.institution] || 
                          stageCompatibility[program.institution]?.[program.program_code] || 
                          ['fikir', 'prototip', 'pilot', 'urun'];

    return suitableStages.includes(projectStage) ? 100 : 60;
  }

  getMatchDetails(projectData, program) {
    const details = {
      sector_match: this.calculateSectorMatch(projectData.sector, program.target_sectors) > 70,
      budget_compatible: this.calculateBudgetMatch(projectData.budget, program) > 70,
      duration_suitable: this.calculateDurationMatch(projectData.duration_months, program) > 70,
      applicant_eligible: this.calculateApplicantMatch(projectData.applicant_type, program.eligible_applicants) > 70,
      stage_appropriate: this.calculateStageMatch(projectData.project_stage, program) > 70
    };

    details.overall_compatibility = Object.values(details).filter(Boolean).length / Object.keys(details).length * 100;

    return details;
  }

  /**
   * Program başvuru takvimi analizi
   */
  async getApplicationCalendar() {
    try {
      const programs = await GrantProgram.findAll({
        where: {
          status: { [Op.in]: ['active', 'upcoming'] },
          application_end_date: { [Op.gte]: new Date() }
        },
        order: [['application_end_date', 'ASC']]
      });

      return programs.map(program => ({
        program_code: program.program_code,
        program_name: program.program_name,
        institution: program.institution,
        application_start: program.application_start_date,
        application_end: program.application_end_date,
        days_remaining: Math.ceil((program.application_end_date - new Date()) / (1000 * 60 * 60 * 24)),
        urgency_level: this.getUrgencyLevel(program.application_end_date)
      }));

    } catch (error) {
      console.error('Başvuru takvimi hatası:', error);
      throw error;
    }
  }

  getUrgencyLevel(endDate) {
    const daysRemaining = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 7) return 'kritik';
    if (daysRemaining <= 30) return 'acil';
    if (daysRemaining <= 60) return 'orta';
    return 'dusuk';
  }
}

module.exports = new SmartMatchingService();