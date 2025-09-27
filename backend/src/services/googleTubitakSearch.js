const axios = require('axios');

class GoogleTubitakSearch {
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY;
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    this.baseUrl = 'https://www.googleapis.com/customsearch/v1';
    this.isEnabled = !!(this.apiKey && this.searchEngineId);
  }
  
  async searchTubitakProjects(query, limit = 10) {
    if (!this.isEnabled) {
      console.log('Google Search API yapılandırılmamış, fallback kullanılıyor');
      return this.getFallbackResults(query);
    }
    
    try {
      const searchQueries = [
        `site:search.trdizin.gov.tr "${query}" proje`,
        `site:trdizin.gov.tr "${query}"`,
        `site:tubitak.gov.tr "${query}" proje`,
        `"${query}" TÜBİTAK destekli araştırma`
      ];
      
      const allResults = [];
      
      for (const searchQuery of searchQueries) {
        const results = await this.performSearch(searchQuery, 3);
        allResults.push(...results);
        
        if (allResults.length >= limit) break;
      }
      
      return this.deduplicateResults(allResults).slice(0, limit);
      
    } catch (error) {
      console.error('Google Search hatası:', error);
      return this.getFallbackResults(query);
    }
  }
  async performSearch(query, num = 10) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          cx: this.searchEngineId,
          q: query,
          num: Math.min(num, 10),
          hl: 'tr'
        }
      });
      
      return this.parseResults(response.data.items || []);
      
    } catch (error) {
      console.error('Google API çağrı hatası:', error);
      return [];
    }
  }
  
  parseResults(items) {
    return items.map(item => {
      const projectInfo = this.extractProjectInfo(item.title, item.snippet);
      
      return {
        title: projectInfo.title || item.title,
        institution: projectInfo.institution || 'TÜBİTAK',
        category: projectInfo.category || 'Araştırma',
        year: projectInfo.year || 'N/A',
        budget: projectInfo.budget || 'N/A',
        abstract: item.snippet,
        url: item.link,
        source: 'Google Search API'
      };
    });
  }
  
  extractProjectInfo(title, snippet) {
    const info = {};
    
    info.title = title.replace(/- TÜBİTAK|TÜBİTAK -/gi, '').trim();
    
    const institutionMatch = snippet.match(/(İTÜ|ODTÜ|Boğaziçi|Hacettepe|Ankara Üniversitesi)/i);
    if (institutionMatch) info.institution = institutionMatch[1];
    
    const yearMatch = snippet.match(/20(1[0-9]|2[0-5])/);
    if (yearMatch) info.year = yearMatch[0];
    
    const budgetMatch = snippet.match(/(\d+(?:\.\d+)?)\s*(TL|₺)/i);
    if (budgetMatch) info.budget = budgetMatch[0];
    
    if (snippet.includes('sağlık') || snippet.includes('tıp')) {
      info.category = 'Sağlık Araştırmaları';
    } else if (snippet.includes('yazılım') || snippet.includes('AI')) {
      info.category = 'Teknoloji ve Yenilik';
    }
    
    return info;
  }
  
  deduplicateResults(results) {
    const seen = new Set();
    return results.filter(result => {
      const key = result.title.toLowerCase().substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  async checkProjectSimilarity(title, description) {
      try {
        // Anahtar kelimeleri çıkar
        const keywords = this.extractKeywords(title, description);
        console.log('Çıkarılan anahtar kelimeler:', keywords);
        
        // Arama sorgularını oluştur
        const searchQueries = this.buildSearchQueries(keywords);
        console.log('Arama sorguları:', searchQueries);
        
        let allResults = [];
        for (const query of searchQueries) {
          const results = await this.performSearch(query, 3);
          allResults.push(...results);
          if (allResults.length >= 10) break;
        }
        
        // Tekrarlanan sonuçları temizle
        const uniqueResults = this.deduplicateResults(allResults);
        console.log('Bulunan benzersiz sonuç sayısı:', uniqueResults.length);
        
        return {
          similarity_found: uniqueResults.length > 0,
          most_similar: uniqueResults[0] || null,
          all_similar: uniqueResults.slice(0, 5),
          total_found: uniqueResults.length,
          risk_level: uniqueResults.length > 3 ? 'high' : uniqueResults.length > 0 ? 'medium' : 'low',
          message: uniqueResults.length > 0 ? `${uniqueResults.length} benzer proje bulundu` : 'Benzer proje bulunamadı'
        };
        
      } catch (error) {
        console.error('Benzerlik kontrolü hatası:', error);
        return {
          similarity_found: false,
          risk_level: 'error',
          message: 'Benzerlik kontrolünde hata oluştu'
        };
      }
    }

    extractKeywords(title, description) {
      const stopWords = ['ile', 'için', 'olan', 'bir', 've', 'bu', 'şu', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
      const text = `${title} ${description}`.toLowerCase()
        .replace(/[^\w\sğüşıöçĞÜŞIÖÇ]/g, ' ');
      
      const words = text.split(/\s+/)
        .filter(word => word.length > 2)
        .filter(word => !stopWords.includes(word))
        .filter(word => !['proje', 'sistem', 'geliştirme', 'araştırma', 'çalışma'].includes(word));
        
      // En önemli 4-5 kelimeyi al
      return words.slice(0, 5);
    }

    buildSearchQueries(keywords) {
      if (keywords.length === 0) return ['TÜBİTAK proje'];
      
      const queries = [];
      
      // İki kelime kombinasyonları
      if (keywords.length >= 2) {
        queries.push(`"${keywords[0]}" "${keywords[1]}" TÜBİTAK`);
        queries.push(`${keywords[0]} ${keywords[1]} TÜBİTAK proje`);
      }
      
      // Üç kelime kombinasyonu
      if (keywords.length >= 3) {
        queries.push(`${keywords[0]} ${keywords[1]} ${keywords[2]} TÜBİTAK`);
      }
      
      // Tekli aramalar
      queries.push(`${keywords[0]} TÜBİTAK araştırma`);
      if (keywords[1]) {
        queries.push(`${keywords[1]} TÜBİTAK proje`);
      }
      
      return queries;
    }
  
  getFallbackResults(query) {
    const sampleProjects = [
      {
        title: "Yapay Zeka ile Sağlık Tanı Sistemi",
        institution: "İTÜ",
        category: "Sağlık Araştırmaları",
        year: "2023",
        budget: "500,000 TL",
        source: "Fallback Data"
      }
    ];
    
    const queryLower = query.toLowerCase();
    return sampleProjects.filter(project => 
      project.title.toLowerCase().includes(queryLower) ||
      project.category.toLowerCase().includes(queryLower)
    );
  }
}

module.exports = GoogleTubitakSearch;