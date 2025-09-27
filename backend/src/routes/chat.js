const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Conversation, Message, User, Project } = require('../models');
const tubitakSearchService = require('../services/tubitakSearchService');
const router = express.Router();

// JWT Middleware (opsiyonel - anonim kullanıcılar da desteklenir)
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.userId = decoded.userId;
    } catch (error) {
      // Token geçersizse anonim olarak devam et
      req.userId = null;
    }
  }
  next();
};

// User'ı kontrol et ve gerekirse oluştur
const ensureUser = async (userId) => {
  if (!userId) return null;
  
  try {
    const [user, created] = await User.findOrCreate({
      where: { id: userId },
      defaults: {
        id: userId,
        name: 'Anonim Kullanıcı',
        email: `user_${userId.slice(0, 8)}@temp.local`,
        is_active: true,
        preferences: {}
      }
    });
    
    if (created) {
      console.log(`Yeni kullanıcı oluşturuldu: ${userId}`);
    }
    
    return user;
  } catch (error) {
    console.error('User creation error:', error);
    return null;
  }
};

// @route   POST /api/chat/message
// @desc    Chatbot mesaj işleme
// @access  Public (anonim desteklenir)
router.post('/message', optionalAuth, async (req, res) => {
  try {
    const { message, conversationId, projectId } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Mesaj gerekli' });
    }

    let conversation;
    let sessionId;
    let effectiveUserId = null;

    // Eğer userId varsa, user'ı kontrol et/oluştur
    if (req.userId) {
      const user = await ensureUser(req.userId);
      effectiveUserId = user ? user.id : null;
    }

    // Conversation ID varsa mevcut konuşmayı bul
    if (conversationId) {
      conversation = await Conversation.findOne({
        where: { 
          id: conversationId,
          ...(effectiveUserId ? { user_id: effectiveUserId } : { user_id: null })
        }
      });
    }

    // Yeni konuşma oluştur
    if (!conversation) {
      sessionId = uuidv4();
      
      conversation = await Conversation.create({
        user_id: effectiveUserId,
        session_id: sessionId,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        project_id: projectId || null,
        conversation_type: projectId ? 'project_consultation' : 'general_help',
        last_activity: new Date(),
        message_count: 0
      });
    }

    // Kullanıcı mesajını kaydet
    const userMessage = await Message.create({
      conversation_id: conversation.id,
      sender_type: 'user',
      content: message.trim(),
      content_type: 'text',
      message_type: 'chat'
    });

    // Bot yanıtını oluştur
    let botResponse = '';
    let intent = 'general';

    // Gelişmiş Türkçe karakter normalizasyonu
    const messageLower = message.toLowerCase()
      .replace(/İ/g, 'i')
      .replace(/Ğ/g, 'g') 
      .replace(/Ü/g, 'u')
      .replace(/Ş/g, 's')
      .replace(/Ö/g, 'o')
      .replace(/Ç/g, 'c')
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/i̇/g, 'i'); // Noktalı i problemi

    // TÜBİTAK Benzerlik Kontrolü
    if (messageLower.includes('proje kontrol') || messageLower.includes('benzer var mi') || messageLower.includes('benzerlik kontrol')) {
      botResponse = `TÜBİTAK veritabanında proje benzerlik kontrolü yapabilirim. Lütfen şu formatta bilgi verin:

**Format:**
Başlık: [Proje başlığınız]
Açıklama: [Kısa açıklama]

**Örnek:**
Başlık: Yapay Zeka ile Sağlık Tanı Sistemi
Açıklama: Makine öğrenmesi algoritmaları kullanarak hastalık teşhisi

1,800+ TÜBİTAK projesi arasında benzerlik kontrolü yapacağım.`;
      intent = 'similarity_check_request';

    } else if ((message.includes('Başlık:') || message.includes('Baslik:')) && 
           (message.includes('Açıklama:') || message.includes('Aciklama:'))) {
      const titleMatch = message.match(/Başlık:\s*(.+?)(?=Açıklama:|$)/);
      const descMatch = message.match(/Açıklama:\s*(.+)/);
      
      if (titleMatch && descMatch) {
        const title = titleMatch[1].trim();
        const description = descMatch[1].trim();
        
        botResponse = `Proje kontrolü başlatılıyor...

**Kontrol Edilen Proje:** ${title}

TÜBİTAK veritabanında benzer projeler aranıyor. Bu işlem 5-10 saniye sürebilir...`;
        
        // Arka planda similarity check
        setTimeout(async () => {
          try {
            console.log('🔍 Benzerlik kontrolü başlıyor...');
            console.log('🔍 Title:', title);
            console.log('🔍 Description:', description);

            const result = await tubitakSearchService.checkProjectSimilarity(title, description);
            console.log('🔍 Benzerlik sonucu:', result);
            
            let followupMessage = `**Benzerlik Kontrolü Tamamlandı**\n\n`;
            
            if (result.similarity_found) {
              followupMessage += `⚠️ **UYARI - Benzer Proje Bulundu!**\n\n`;
              followupMessage += `**Bulunan:** ${result.total_found} benzer proje\n`;
              followupMessage += `**Risk Seviyesi:** ${result.risk_level.toUpperCase()}\n\n`;
              
              if (result.most_similar) {
                followupMessage += `**En Benzer Proje:**\n`;
                followupMessage += `📋 ${result.most_similar.title}\n`;
                followupMessage += `🏢 ${result.most_similar.institution}\n`;
                followupMessage += `🏷️ ${result.most_similar.category}\n`;
                followupMessage += `📅 ${result.most_similar.start_year}\n`;
                followupMessage += `💰 ${result.most_similar.budget}\n\n`;
              }
              
              followupMessage += `**Öneriler:**\n`;
              followupMessage += `• Projenizde farklılaştırıcı yönleri vurgulayın\n`;
              followupMessage += `• Yenilikçi yaklaşımınızı öne çıkarın\n`;
              followupMessage += `• Mevcut çalışmadan nasıl farklılaştığınızı belirtin`;
            } else {
              followupMessage += `✅ **İyi Haber - Benzer Proje Bulunamadı!**\n\n`;
              followupMessage += `Projeniz özgün görünüyor. Başvuru sürecine güvenle devam edebilirsiniz.\n\n`;
              followupMessage += `**Sonraki Adımlar:**\n`;
              followupMessage += `• Uygun hibe programını seçin\n`;
              followupMessage += `• Teknik dosyayı hazırlayın\n`;
              followupMessage += `• Bütçe planlaması yapın`;
            }
            
            if (result.message) {
              followupMessage += `\n\n**Bilgi:** ${result.message}`;
            }
            
            if (followupMessage && followupMessage.trim().length > 0) {
                await Message.create({
                  conversation_id: conversation.id,
                  sender_type: 'bot',
                  content: followupMessage,
                  intent: 'similarity_check_result'
                });
              } else {
                await Message.create({
                  conversation_id: conversation.id,
                  sender_type: 'bot',
                  content: 'Benzerlik kontrolü tamamlandı ancak sonuç oluşturulamadı.',
                  intent: 'similarity_check_error'
                });
              }
            
          } catch (error) {
            console.error('TÜBİTAK kontrol hatası:', error);
            console.error('🔥 BENZERLİK KONTROL HATASI:', error);
            
            await Message.create({
              conversation_id: conversation.id,
              sender_type: 'bot',
              content: 'Benzerlik kontrolünde teknik bir sorun oluştu. Lütfen daha sonra tekrar deneyin.',
              intent: 'similarity_check_error'
            });
          }
        }, 2000);
        
        intent = 'tubitak_similarity_check';
      }
      
    } else if ((messageLower.includes('tubitak') || /t[iu]b[iu][it]ak/i.test(message)) && 
              (messageLower.includes('ara') || messageLower.includes('proje') || 
                messageLower.includes('bul') || messageLower.includes('listele') || 
                messageLower.includes('goster'))) {
      
      console.log('🚀 TÜBİTAK ARAMA BLOGU TETIKLENDI');
      const searchTerm = message
        .replace(/tubitak|tübitak|TÜBİTAK|TUBITAK/gi, '')  // TÜBİTAK'ı kaldır
        .replace(/ara|proje|göster|bul|listele|projelerini|lerini|leri/gi, '')  // Ekleri kaldır
        .replace(/\s+/g, ' ')  // Çoklu boşlukları tek yap
        .trim();
      
      if (searchTerm.length > 2) {
        try {
          // Direkt arama yap - setTimeout kullanma
          console.log('🔍 TÜBİTAK aramasi baslatiluyor:', searchTerm);
          const results = await tubitakSearchService.searchProjects(searchTerm, 20);
          console.log('✅ Arama tamamlandi:', results.length, 'sonuc');
          
          if (results.length > 0) {
            botResponse = `**🎯 TÜBİTAK Arama Sonuçları**\n\n`;
            botResponse += `🔎 **Arama:** "${searchTerm}"\n`;
            botResponse += `📊 **Bulunan:** ${results.length} proje\n`;
            botResponse += `🌐 **Kaynak:** Google Custom Search API\n\n`;
            
            results.forEach((project, index) => {
              botResponse += `**${index + 1}. ${project.title}**\n`;
              botResponse += `🏢 ${project.institution} | 🏷️ ${project.category}\n`;
              botResponse += `📅 ${project.year} | 💰 ${project.budget}\n`;
              if (project.url) {
                botResponse += `🔗 [Detay](${project.url})\n`;
              }
              botResponse += `\n`;
            });
            
            botResponse += `✨ **Bu sonuçlar TR Dizin ve TÜBİTAK sitelerinden gerçek zamanlı olarak çekilmiştir.**`;
          } else {
            botResponse = `❌ "${searchTerm}" ile ilgili proje bulunamadı.\n\n`;
            botResponse += `**💡 Arama İpuçları:**\n`;
            botResponse += `• Daha genel terimler kullanın\n`;
            botResponse += `• Farklı anahtar kelimeler deneyin\n`;
            botResponse += `• "yapay zeka", "sağlık", "enerji" gibi ana kategoriler`;
          }
          
          intent = 'tubitak_search_result';
          
        } catch (error) {
          console.error('🔥 TÜBİTAK arama hatası:', error);
          botResponse = `❌ **Arama Hatası**\n\nTeknik sorun: ${error.message}\n\nLütfen daha sonra tekrar deneyin.`;
          intent = 'tubitak_search_error';
        }
      } else {
        botResponse = `❗ TÜBİTAK arama için daha spesifik bir terim girin.\n\n**Örnek:** "TÜBİTAK yapay zeka projelerini ara"`;
        intent = 'tubitak_search_help';
      }

    // Mevcut hibe program sorguları
    } else if (messageLower.includes('hibe program') || messageLower.includes('destek program')) {
        botResponse = `TÜBİTAK ve EPDK'nın başlıca hibe programları şunlardır:

**TÜBİTAK Programları:**
- 1001 - Bilimsel ve Teknolojik Araştırma Projeleri
- 1511 - Öncelikli Alanlar Araştırma Teknoloji Geliştirme
- 1003 - Birincil Araştırma Fonlama Programı

**EPDK Programları:**
- Ar-Ge Destek Programı (Enerji sektörü)
- Yenilenebilir Enerji Projeleri

**KOSGEB Programları:**
- Ar-Ge, İnovasyon ve Endüstriyel Uygulama Destek Programı
- Girişimcilik Destek Programı

Hangi sektörde proje geliştirmek istiyorsunuz? Size daha spesifik program önerebilirim.`;
        intent = 'program_info';
    } else if (messageLower.includes('basvuru') || messageLower.includes('başvuru')) {
        botResponse = `Başvuru süreci genelde şu adımları içerir:

1. **Program Seçimi**: Projenize uygun programı belirleyin
2. **Proje Hazırlığı**: Teknik dosya ve bütçe hazırlayın  
3. **Başvuru**: Online sistemden başvurunuzu yapın
4. **Değerlendirme**: Teknik ve mali değerlendirme süreci
5. **Sonuç**: Kabul/red kararı ve sözleşme imzalama

Hangi aşamada yardıma ihtiyacınız var?`;
        intent = 'application_process';
    } else if (messageLower.includes('butce') || messageLower.includes('para')) {
        botResponse = `Hibe programlarının bütçe limitleri:

- TÜBİTAK 1001: 500.000 - 2.000.000 TL
- TÜBİTAK 1511: 1.000.000 - 5.000.000 TL  
- EPDK Ar-Ge: 200.000 - 1.500.000 TL
- KOSGEB: 100.000 - 1.000.000 TL

Projenizin tahmini bütçesi nedir? Size uygun programları önerebilirim.`;
        intent = 'budget_info';
    } else if (messageLower.includes('sektor') || messageLower.includes('alan')) {
        botResponse = `Hangi sektörde çalışıyorsunuz? Desteklenen ana sektörler:

🔋 **Enerji**: Yenilenebilir enerji, enerji verimliliği
💻 **Teknoloji**: Yazılım, AI, blockchain, IoT
🏥 **Sağlık**: Medikal cihaz, ilaç, biyoteknoloji  
🌱 **Tarım**: Akıllı tarım, gıda teknolojileri
🏭 **İmalat**: Endüstri 4.0, otomasyon

Sektörünüzü belirtirseniz spesifik program önerilerim olur.`;
        intent = 'sector_inquiry';
    } else if (messageLower.includes('merhaba') || messageLower.includes('selam')) {
        botResponse = 'Merhaba! TÜBİTAK-EPDK Proje Asistanına hoş geldiniz. Size nasıl yardımcı olabilirim? Hibe programları, başvuru süreci, proje değerlendirmesi veya TÜBİTAK proje araması hakkında sorularınızı yanıtlayabilirim.';
        intent = 'greeting';
    } else {
        // Contextual fallback based on previous messages
        botResponse = `Anladım. Size şu konularda yardımcı olabilirim:

- **Hibe programları** - Hangi program size uygun?
- **Başvuru süreci** - Adım adım rehberlik
- **Proje değerlendirmesi** - Projenizi analiz edelim
- **TÜBİTAK proje arama** - 1,800+ proje veritabanında arama
- **Benzerlik kontrolü** - Projeniz daha önce yapılmış mı?
- **Bütçe planlama** - Finansal hazırlık
- **Doküman hazırlama** - Başvuru dosyaları

Hangi konuda detaylı bilgi almak istersiniz?`;
        intent = 'menu_options';
    }

    // Bot mesajını kaydet
    const botMessage = await Message.create({
      conversation_id: conversation.id,
      sender_type: 'bot',
      content: botResponse,
      content_type: 'text',
      message_type: 'chat',
      intent,
      confidence_score: 0.85,
      processing_time_ms: Date.now() - Date.now()
    });

    // Konuşma istatistiklerini güncelle
    await conversation.update({
      last_activity: new Date(),
      message_count: conversation.message_count + 2
    });

    res.json({
      success: true,
      data: {
        conversation_id: conversation.id,
        session_id: conversation.session_id,
        user_message: {
          id: userMessage.id,
          content: userMessage.content,
          timestamp: userMessage.createdAt
        },
        bot_message: {
          id: botMessage.id,
          content: botMessage.content,
          intent: botMessage.intent,
          timestamp: botMessage.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// @route   GET /api/chat/conversations
// @desc    Konuşma listesini getir
// @access  Public
router.get('/conversations', optionalAuth, async (req, res) => {
  try {
    if (!req.userId) {
      return res.json({ success: true, data: [] });
    }

    // User'ı kontrol et
    const user = await ensureUser(req.userId);
    if (!user) {
      return res.json({ success: true, data: [] });
    }

    const conversations = await Conversation.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']]
        }
      ],
      order: [['last_activity', 'DESC']],
      limit: 20
    });

    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      last_activity: conv.last_activity,
      message_count: conv.message_count,
      preview: conv.messages[0]?.content?.substring(0, 50) + '...' || 'Boş konuşma'
    }));

    res.json({
      success: true,
      data: formattedConversations
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;