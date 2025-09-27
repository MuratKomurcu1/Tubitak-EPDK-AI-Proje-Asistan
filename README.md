# 🚀 TÜBİTAK & EPDK AI Proje Asistanı  

**Yapay Zeka Destekli Hibe ve Proje Danışmanlığı Platformu**  
💡 *Fikrinizi projeye, projenizi başarıya dönüştürün.*  

---

## 🎯 Projenin Amacı  

TÜBİTAK, EPDK, KOSGEB ve TEYDEB gibi ulusal hibe ve teşvik programları; **inovatif, katma değerli ve stratejik projelere** öncelik tanır.  

Ancak birçok girişimci ve araştırmacı, başvuru sürecinde fikirlerini doğru şekilde olgunlaştıramadığı için destek şansını kaybeder.  

👉 **TÜBİTAK & EPDK AI Proje Asistanı**, bu sürece rehberlik ederek:  
- ✅ Projenizin özgünlüğünü ve pazar potansiyelini değerlendirir  
- ✅ Benzer projeleri analiz ederek tekrara düşmenizi engeller  
- ✅ En uygun hibe programlarını otomatik eşleştirir  
- ✅ Başvuru dokümanlarını **AI destekli içerik üretimi** ile hazırlar  

🔑 **Sonuç:** Daha güçlü, stratejik ve kabul şansı yüksek proje başvuruları.  

---

## ✨ Temel Özellikler  

### 🤖 Akıllı Proje Analizi  
- Proje başlığı, açıklaması, sektörü ve bütçesi üzerinden **Llama3.2:3B destekli analiz**  
- Güçlü yönler, zayıf noktalar, inovasyon seviyesi ve pazar potansiyeli  

### 🔍 TÜBİTAK & TR Dizin Entegrasyonu  
- Google Custom Search API ile **gerçek zamanlı proje araması**  
- Benzerlik kontrolü ile **özgünlük teyidi**  

### 💡 Hibe Programı Eşleştirme  
- Sektör, bütçe, süre ve anahtar kelimelere göre **program skorlaması**  
- En uygun TÜBİTAK / KOSGEB / TEYDEB çağrılarını önerme  

### 💬 Etkileşimli Sohbet Asistanı  
- Doğal dil desteği  
- Kullanıcı → “Projem enerji verimliliği alanında, uygun destek var mı?”  
- Asistan → “TEYDEB 1501 Sanayi Ar-Ge Destek Programı uygun görünüyor.”  

### 👤 Kullanıcı & Proje Yönetimi  
- JWT tabanlı güvenli kimlik doğrulama  
- Proje oluşturma, yönetme ve analiz geçmişini görüntüleme  

### 📊 Veri Modelleme & Saklama  
- PostgreSQL üzerinde **ilişkisel veri mimarisi**  
- Sequelize ORM ile ölçeklenebilir veritabanı yönetimi  

---

## 🛠️ Teknoloji Altyapısı  

- **Backend:** Node.js, Express.js  
- **Veritabanı:** PostgreSQL + Sequelize ORM  
- **Kimlik Doğrulama:** JWT, bcryptjs  
- **API Güvenliği:** Helmet, CORS, Morgan  
- **Harici Servisler:** Google Custom Search API  
- **Development:** Nodemon  

---

## 🏗️ Sistem Mimarisi  

**Modeller:**  
- `User` → Kullanıcı bilgileri  
- `Project` → Proje fikirleri  
- `GrantProgram` → Hibe & teşvik programları  
- `Analysis` → Yapılan proje analizleri  
- `Conversation & Message` → Chatbot etkileşimleri  

**RESTful API Endpointleri (Özet):**  
- `/api/auth/*` → Kayıt, giriş, kullanıcı bilgisi  
- `/api/projects/*` → Proje oluşturma & yönetim  
- `/api/analysis/*` → Proje analizi (AI & kural tabanlı)  
- `/api/chat/message` → Sohbet botu entegrasyonu  
- `/api/tubitak/*` → TÜBİTAK arama & benzerlik kontrolü  

---

## 🚀 Kurulum  

1. **Projeyi klonlayın**  
```bash
git clone https://github.com/MuratKomurcu1/Tubitak-EPDK-AI-Proje-Asistan.git
cd Tubitak-EPDK-AI-Proje-Asistan
```
2. **Bağımlılıkları yükleyin**
 ```bash
 npm install
```
3. **.env dosyasını ayarlayın**
 ```bash
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tubitak_epdk_db
DB_USER=postgres
DB_PASS=sifreniz
JWT_SECRET=gizli_anahtar
GOOGLE_API_KEY=xxx
GOOGLE_SEARCH_ENGINE_ID=xxx
NODE_ENV=development
 ```
4. **Veritabanını başlatın (PostgreSQL kurulu olmalı)**
5. **Uygulamayı çalıştırın**
 ```bash
npm run dev   # Geliştirme modu
npm start     # Normal mod
 ```
🌐 Sunucu: http://localhost:5000
