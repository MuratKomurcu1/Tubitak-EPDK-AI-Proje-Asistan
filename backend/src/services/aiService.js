const axios = require('axios');

class AIService {
  constructor() {
    this.ollamaUrl = 'http://localhost:11434';
    this.defaultModel = 'llama3.2:3b';
  }

  async isOllamaRunning() {
    try {
      await axios.get(`${this.ollamaUrl}/api/tags`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async analyzeProjectWithAI(projectData) {
    const isRunning = await this.isOllamaRunning();
    if (!isRunning) {
      throw new Error('Ollama servisi çalışmıyor. Lütfen Ollama\'yı başlatın.');
    }

    const prompt = this.createAnalysisPrompt(projectData);
    
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.defaultModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 1000
        }
      });

      return this.parseAIResponse(response.data.response);
    } catch (error) {
      throw new Error(`AI analiz hatası: ${error.message}`);
    }
  }

  createAnalysisPrompt(projectData) {
    return `Sen TÜBİTAK ve EPDK hibe programları uzmanısın. Aşağıdaki projeyi analiz et:

PROJE BİLGİLERİ:
Başlık: ${projectData.title}
Açıklama: ${projectData.description}
Sektör: ${projectData.sector || 'Belirtilmemiş'}
Bütçe: ${projectData.budget ? projectData.budget + ' TL' : 'Belirtilmemiş'}

GÖREV:
1. Projenin yenilik seviyesini değerlendir (1-10)
2. Uygun hibe programlarını öner
3. 3 güçlü yanını belirt
4. 3 iyileştirme önerisini ver
5. Başarı şansını yüzde olarak tahmin et

Cevabını JSON formatında ver:
{
  "innovation_score": sayı,
  "suitable_programs": ["program1", "program2"],
  "strengths": ["güçlü_yan_1", "güçlü_yan_2", "güçlü_yan_3"],
  "improvements": ["öneri_1", "öneri_2", "öneri_3"],
  "success_rate": sayı,
  "summary": "kısa özet"
}`;
  }

  parseAIResponse(response) {
    try {
      // JSON'u çıkarmaya çalış
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = response.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonStr);
      }
      
      // JSON bulunamadıysa basit parsing
      return {
        innovation_score: 7,
        suitable_programs: ['TÜBİTAK 1001'],
        strengths: ['AI tarafından analiz edildi'],
        improvements: ['Daha detaylı bilgi gerekli'],
        success_rate: 70,
        summary: response.substring(0, 200) + '...'
      };
    } catch (error) {
      return {
        innovation_score: 6,
        suitable_programs: ['Genel Destek'],
        strengths: ['Proje potansiyeli mevcut'],
        improvements: ['AI analizi tamamlanamadı'],
        success_rate: 60,
        summary: 'AI analizi sırasında hata oluştu'
      };
    }
  }

  async generateProjectDocument(projectData, analysisResult) {
    const prompt = `Aşağıdaki proje için TÜBİTAK başvuru dokümanının taslağını oluştur:

PROJE: ${projectData.title}
AÇIKLAMA: ${projectData.description}
ANALİZ SONUCU: ${JSON.stringify(analysisResult)}

Şu bölümleri içeren bir doküman oluştur:
1. Proje Özeti
2. Amaç ve Hedefler  
3. Yöntem
4. Beklenen Çıktılar
5. Bütçe Gerekçesi

Profesyonel ve akademik dil kullan.`;

    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.defaultModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.4,
          max_tokens: 2000
        }
      });

      return response.data.response;
    } catch (error) {
      throw new Error(`Doküman oluşturma hatası: ${error.message}`);
    }
  }
}

module.exports = new AIService();