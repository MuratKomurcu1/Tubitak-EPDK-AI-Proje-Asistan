// services/tubitakSearchService.js - Tam güncellenmiş versiyon
const GoogleTubitakSearch = require('./googleTubitakSearch');

class TubitakSearchService {
  constructor() {
    this.googleSearch = new GoogleTubitakSearch();
    this.isEnabled = process.env.TUBITAK_SEARCH_ENABLED === 'true';
    this.maxResults = parseInt(process.env.TUBITAK_MAX_RESULTS) || 50;
  }
  
  async searchProjects(query, limit = 10) {
    if (!this.isEnabled) {
      return this.getFallbackResponse(query);
    }
    
    try {
      // Google Search API kullan
      const results = await this.googleSearch.searchTubitakProjects(query, limit);
      return results;
      
    } catch (error) {
      console.error('TÜBİTAK arama hatası:', error.message);
      return this.getFallbackResponse(query);
    }
  }
  
  async checkProjectSimilarity(projectTitle, projectDescription) {
    console.log('🔍 Service disabled, returning fallback');
    console.log('🔍 checkProjectSimilarity çağrıldı:', projectTitle);
    if (!this.isEnabled) {
      return { 
        similarity_found: false, 
        risk_level: 'unknown',
        message: 'Benzerlik kontrolü şu anda kullanılamıyor' 
      };
    }
    
    try {
      // Google Search ile benzerlik kontrolü
      console.log('🔍 Google Search yapılıyor...');
      const result = await this.googleSearch.checkProjectSimilarity(projectTitle, projectDescription);
      console.log('🔍 Google Search sonucu:', result);
      return result;
      
    } catch (error) {
      console.error('Benzerlik kontrolü hatası:', error);
      console.error('🔥 checkProjectSimilarity hatası:', error);
      return { 
        similarity_found: false, 
        risk_level: 'error',
        message: 'Benzerlik kontrolünde hata oluştu' 
      };
    }
  }
  
  async getStatistics() {
    return {
      available: this.isEnabled,
      search_engine: 'Google Custom Search API',
      max_results: this.maxResults
    };
  }
  
  getFallbackResponse(query) {
    const sampleProjects = [
      {
        title: "Yapay Zeka ile Sağlık Tanı Sistemi",
        institution: "İTÜ",
        category: "Sağlık Araştırmaları",
        year: "2023",
        budget: "500,000 TL",
        source: "Fallback Data"
      },
      {
        title: "Makine Öğrenmesi ile Görüntü İşleme",
        institution: "ODTÜ",
        category: "Teknoloji ve Yenilik",
        year: "2022",
        budget: "750,000 TL",
        source: "Fallback Data"
      }
    ];
    
    const queryLower = query.toLowerCase();
    return sampleProjects.filter(project => 
      project.title.toLowerCase().includes(queryLower) ||
      project.category.toLowerCase().includes(queryLower) ||
      queryLower.includes('yapay zeka') ||
      queryLower.includes('makine') ||
      queryLower.includes('ai')
    );
  }
  //ddd
  async searchProjects(query, limit = 10) {
  console.log('🔥 SEARCH METHOD CALLED:', query);
  console.log('🔥 isEnabled:', this.isEnabled);
  console.log('🔥 API Key exists:', !!this.googleSearch.apiKey);
  console.log('🔥 Search Engine ID exists:', !!this.googleSearch.searchEngineId);
  
  if (!this.isEnabled) {
    console.log('🔥 USING FALLBACK');
    return this.getFallbackResponse(query);
  }
  
  try {
    console.log('🔥 CALLING GOOGLE SEARCH');
    const results = await this.googleSearch.searchTubitakProjects(query, limit);
    console.log('🔥 GOOGLE RESULTS:', results.length);
    return results;
    
  } catch (error) {
    console.error('🔥 SEARCH ERROR:', error.message);
    return this.getFallbackResponse(query);
  }
}
}



module.exports = new TubitakSearchService();