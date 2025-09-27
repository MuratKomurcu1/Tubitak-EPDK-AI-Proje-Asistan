const { GrantProgram } = require('./models');

// TÜBİTAK ARDEB Programları (Akademik)
const ardebPrograms = [
  {
    program_code: "1001",
    institution: "TUBITAK",
    program_name: "Bilimsel ve Teknolojik Araştırma Projeleri Destekleme Programı",
    program_title: "TÜBİTAK 1001 - Bilimsel ve Teknolojik Araştırma Projeleri",
    description: "Üniversiteler ve kamu araştırma kurumlarında gerçekleştirilen temel ve uygulamalı araştırma projelerini destekler.",
    objectives: [
      "Bilimsel bilgi üretimi ve teknolojik yenilik",
      "Araştırma altyapısının güçlendirilmesi",
      "Uluslararası işbirliğinin artırılması"
    ],
    target_sectors: ["teknoloji", "saglik", "enerji", "tarim", "egitim"],
    eligible_applicants: ["universiteler", "kamu_arastirma_kurumlari"],
    min_budget: 100000,
    max_budget: 2000000,
    funding_rate: 100,
    min_duration_months: 12,
    max_duration_months: 36,
    evaluation_criteria: {
      innovation: { weight: 30, description: "Bilimsel yenilik ve özgünlük" },
      feasibility: { weight: 25, description: "Projenin gerçekleştirilebilirliği" },
      impact: { weight: 25, description: "Bilimsel ve toplumsal etki" },
      team: { weight: 20, description: "Araştırma takımının yetkinliği" }
    },
    required_documents: ["Proje önerisi", "CV'ler", "Bütçe planı", "Etik kurul onayı"],
    keywords: ["temel_arastirma", "uygulamali_arastirma", "yenilik"],
    priority_areas: ["yapay_zeka", "biyoteknoloji", "nanoteknoloji", "enerji"],
    website_url: "https://www.tubitak.gov.tr/tr/destekler/akademik/ulusal-destek-programlari/1001",
    status: "active",
    is_continuous: true
  },
  
  {
    program_code: "1002",
    institution: "TUBITAK",
    program_name: "Hızlı Destek Programı",
    program_title: "TÜBİTAK 1002 - Hızlı Destek",
    description: "Acil durumlarda hızlı başvuru ve değerlendirme süreci ile araştırma projelerini destekler.",
    objectives: ["Acil araştırma ihtiyaçlarının karşılanması", "Hızlı bilimsel yanıt"],
    target_sectors: ["saglik", "teknoloji", "enerji"],
    eligible_applicants: ["universiteler", "kamu_arastirma_kurumlari"],
    min_budget: 50000,
    max_budget: 500000,
    funding_rate: 100,
    min_duration_months: 6,
    max_duration_months: 18,
    evaluation_criteria: {
      urgency: { weight: 40, description: "Aciliyet düzeyi" },
      feasibility: { weight: 30, description: "Hızlı gerçekleştirilebilirlik" },
      impact: { weight: 30, description: "Acil etki potansiyeli" }
    },
    required_documents: ["Kısa proje önerisi", "CV'ler"],
    keywords: ["acil", "hizli", "kriz"],
    status: "active",
    is_continuous: true
  },

  {
    program_code: "1003",
    institution: "TUBITAK",
    program_name: "Birincil Araştırma Fonlama Programı",
    program_title: "TÜBİTAK 1003 - Birincil Araştırma Fonlama",
    description: "Yeni mezun doktora araştırmacılarının bağımsız araştırma yapabilme kapasitelerini destekler.",
    objectives: ["Genç araştırmacıların desteklenmesi", "Bağımsız araştırma kültürü"],
    target_sectors: ["teknoloji", "saglik", "temel_bilimler"],
    eligible_applicants: ["universiteler"],
    min_budget: 150000,
    max_budget: 600000,
    funding_rate: 100,
    min_duration_months: 24,
    max_duration_months: 36,
    evaluation_criteria: {
      innovation: { weight: 40, description: "Araştırmanın özgünlüğü" },
      feasibility: { weight: 30, description: "Proje planının uygulanabilirliği" },
      potential: { weight: 30, description: "Bilimsel katkı potansiyeli" }
    },
    exclusion_criteria: ["Doktora sonrası 8 yıldan fazla geçmiş olmak"],
    website_url: "https://www.tubitak.gov.tr/tr/destekler/akademik/ulusal-destek-programlari/1003",
    status: "active"
  },

  {
    program_code: "1004",
    institution: "TUBITAK",
    program_name: "Araştırma Projesi Geliştirme ve Yönlendirme Programı",
    program_title: "TÜBİTAK 1004 - Proje Geliştirme",
    description: "Araştırma projelerinin hazırlık aşamasında destek sağlar.",
    objectives: ["Proje hazırlık kalitesinin artırılması", "Başvuru başarı oranının yükseltilmesi"],
    target_sectors: ["tum_sektorler"],
    eligible_applicants: ["universiteler", "kamu_arastirma_kurumlari"],
    min_budget: 25000,
    max_budget: 100000,
    funding_rate: 100,
    min_duration_months: 6,
    max_duration_months: 12,
    evaluation_criteria: {
      preparation_quality: { weight: 50, description: "Hazırlık kalitesi" },
      potential: { weight: 50, description: "Proje potansiyeli" }
    },
    status: "active"
  }
];

// TÜBİTAK TEYDEB Programları (Sanayi)
const teydebPrograms = [
  {
    program_code: "1501",
    institution: "TUBITAK",
    program_name: "Sanayi Ar-Ge Projeleri Destekleme Programı",
    program_title: "TÜBİTAK 1501 - Sanayi Ar-Ge",
    description: "Sanayi kuruluşlarının Ar-Ge projelerini destekler.",
    objectives: ["Sanayi Ar-Ge kapasitesinin artırılması", "Yenilikçi ürün geliştirme"],
    target_sectors: ["imalat", "teknoloji", "otomotiv", "makine"],
    eligible_applicants: ["sirketler", "sanayi_kuruluslari"],
    min_budget: 200000,
    max_budget: 3000000,
    funding_rate: 60,
    min_duration_months: 12,
    max_duration_months: 36,
    evaluation_criteria: {
      innovation: { weight: 30, description: "Teknolojik yenilik" },
      commercial_potential: { weight: 30, description: "Ticari potansiyel" },
      feasibility: { weight: 25, description: "Teknik fizibilite" },
      team: { weight: 15, description: "Ekip yeterliliği" }
    },
    required_documents: ["Proje önerisi", "Şirket belgeleri", "Mali tablolar"],
    website_url: "https://www.tubitak.gov.tr/tr/destekler/sanayi/ulusal-destek-programlari/1501",
    status: "active",
    is_continuous: true
  },

  {
    program_code: "1505",
    institution: "TUBITAK",
    program_name: "Üniversite-Sanayi İşbirliği Destekleme Programı",
    program_title: "TÜBİTAK 1505 - Üniversite-Sanayi İşbirliği",
    description: "Üniversite ve sanayi arasındaki işbirliği projelerini destekler.",
    objectives: ["Akademi-sanayi köprüsü kurma", "Teknoloji transferi"],
    target_sectors: ["teknoloji", "imalat", "enerji", "saglik"],
    eligible_applicants: ["universiteler", "sirketler"],
    min_budget: 300000,
    max_budget: 2000000,
    funding_rate: 75,
    min_duration_months: 18,
    max_duration_months: 36,
    evaluation_criteria: {
      collaboration_quality: { weight: 35, description: "İşbirliği kalitesi" },
      innovation: { weight: 30, description: "Yenilik düzeyi" },
      impact: { weight: 35, description: "Endüstriyel etki" }
    },
    required_documents: ["Ortaklık anlaşması", "Proje önerisi", "İş planı"],
    website_url: "https://www.tubitak.gov.tr/tr/destekler/sanayi/ulusal-destek-programlari/1505",
    status: "active"
  },

  {
    program_code: "1507",
    institution: "TUBITAK",
    program_name: "KOBİ Ar-Ge Başlangıç Destek Programı",
    program_title: "TÜBİTAK 1507 - KOBİ Ar-Ge Başlangıç",
    description: "KOBİ'lerin ilk Ar-Ge projelerini destekler.",
    objectives: ["KOBİ Ar-Ge kültürünün yaygınlaştırılması", "İlk adım desteği"],
    target_sectors: ["imalat", "teknoloji", "hizmet"],
    eligible_applicants: ["kobiler"],
    min_budget: 100000,
    max_budget: 800000,
    funding_rate: 75,
    min_duration_months: 12,
    max_duration_months: 24,
    evaluation_criteria: {
      innovation: { weight: 40, description: "Yenilik potansiyeli" },
      feasibility: { weight: 30, description: "Gerçekleştirilebilirlik" },
      market: { weight: 30, description: "Pazar potansiyeli" }
    },
    exclusion_criteria: ["Daha önce TÜBİTAK desteği almış olmak"],
    status: "active"
  },

  {
    program_code: "1511",
    institution: "TUBITAK",
    program_name: "Öncelikli Alanlar Araştırma Teknoloji Geliştirme ve Yenilik Projeleri",
    program_title: "TÜBİTAK 1511 - Öncelikli Alanlar AR-GE",
    description: "Türkiye'nin öncelikli teknoloji alanlarında araştırma, teknoloji geliştirme ve yenilik projelerini destekler.",
    objectives: ["Kritik teknolojilerde yerli çözümler", "Teknolojik rekabet gücü"],
    target_sectors: ["teknoloji", "enerji", "savunma", "saglik"],
    eligible_applicants: ["universiteler", "arastirma_kurumlari", "sirketler"],
    min_budget: 500000,
    max_budget: 5000000,
    funding_rate: 75,
    min_duration_months: 24,
    max_duration_months: 48,
    evaluation_criteria: {
      strategic_importance: { weight: 35, description: "Stratejik önem" },
      innovation: { weight: 30, description: "Teknolojik yenilik düzeyi" },
      feasibility: { weight: 20, description: "Teknik fizibilite" },
      impact: { weight: 15, description: "Ekonomik etki" }
    },
    priority_areas: ["yapay_zeka", "siber_guvenlik", "5g", "blockchain", "robotik"],
    website_url: "https://www.tubitak.gov.tr/tr/destekler/akademik/ulusal-destek-programlari/1511",
    status: "active"
  }
];

// EPDK Programları
const epdkPrograms = [
  {
    program_code: "EPDK-ARGE-2025",
    institution: "EPDK",
    program_name: "Enerji Piyasası Ar-Ge Destek Programı",
    program_title: "EPDK Ar-Ge Destek Programı",
    description: "Enerji sektöründe Ar-Ge faaliyetlerini destekleyerek sektörün teknolojik gelişimini teşvik eder.",
    objectives: ["Enerji verimliliği", "Yenilenebilir enerji teknolojileri", "Enerji güvenliği"],
    target_sectors: ["enerji"],
    eligible_applicants: ["enerji_sirketleri", "universiteler", "teknokentler"],
    min_budget: 200000,
    max_budget: 1500000,
    funding_rate: 50,
    min_duration_months: 18,
    max_duration_months: 36,
    priority_areas: ["akilli_sehir", "enerji_depolama", "gunes_enerjisi", "ruzgar_enerjisi"],
    website_url: "https://www.epdk.gov.tr",
    status: "active"
  },

  {
    program_code: "EPDK-YEN-2025",
    institution: "EPDK",
    program_name: "Yenilenebilir Enerji Teknolojileri Geliştirme Programı",
    program_title: "EPDK Yenilenebilir Enerji Programı",
    description: "Yenilenebilir enerji teknolojilerinin geliştirilmesi ve yaygınlaştırılması.",
    objectives: ["Yerli yenilenebilir teknolojiler", "Karbon nötr hedefleri"],
    target_sectors: ["enerji"],
    eligible_applicants: ["enerji_sirketleri", "teknoloji_sirketleri"],
    min_budget: 500000,
    max_budget: 3000000,
    funding_rate: 40,
    min_duration_months: 24,
    max_duration_months: 48,
    priority_areas: ["gunes_paneli", "ruzgar_turbini", "hibrit_sistemler"],
    status: "active"
  }
];

// KOSGEB Programları
const kosgebPrograms = [
  {
    program_code: "KOSGEB-ARGE-2025",
    institution: "KOSGEB",
    program_name: "Ar-Ge, İnovasyon ve Endüstriyel Uygulama Destek Programı",
    program_title: "KOSGEB Ar-Ge İnovasyon Desteği",
    description: "KOBİ'lerin Ar-Ge ve inovasyon kapasitelerini artırmayı hedefler.",
    objectives: ["KOBİ rekabet gücü", "İnovatif ürün geliştirme", "İhracat potansiyeli"],
    target_sectors: ["imalat", "teknoloji", "hizmet"],
    eligible_applicants: ["kobiler", "girisimciler"],
    min_budget: 100000,
    max_budget: 1000000,
    funding_rate: 60,
    min_duration_months: 12,
    max_duration_months: 24,
    priority_areas: ["dijital_donusum", "e_ticaret", "fintech", "saglik_teknolojileri"],
    website_url: "https://www.kosgeb.gov.tr",
    status: "active"
  },

  {
    program_code: "KOSGEB-GIR-2025",
    institution: "KOSGEB",
    program_name: "Girişimcilik Destek Programı",
    program_title: "KOSGEB Girişimcilik Desteği",
    description: "Yeni girişimcilerin desteklenmesi ve iş kurma süreçlerinin kolaylaştırılması.",
    objectives: ["Girişimcilik ekosistemi", "İstihdam yaratma", "Ekonomik büyüme"],
    target_sectors: ["teknoloji", "hizmet", "imalat"],
    eligible_applicants: ["girisimciler", "yeni_sirketler"],
    min_budget: 50000,
    max_budget: 500000,
    funding_rate: 70,
    min_duration_months: 6,
    max_duration_months: 18,
    priority_areas: ["teknoloji_girisimcilik", "sosyal_girisimcilik"],
    status: "active"
  },

  {
    program_code: "KOSGEB-DIG-2025",
    institution: "KOSGEB",
    program_name: "Dijital Dönüşüm Destek Programı",
    program_title: "KOSGEB Dijital Dönüşüm",
    description: "KOBİ'lerin dijital dönüşüm süreçlerini destekler.",
    objectives: ["Dijital rekabet gücü", "Teknoloji adaptasyonu", "Verimlilik artışı"],
    target_sectors: ["imalat", "hizmet", "ticaret"],
    eligible_applicants: ["kobiler"],
    min_budget: 75000,
    max_budget: 400000,
    funding_rate: 50,
    min_duration_months: 12,
    max_duration_months: 18,
    priority_areas: ["e_ticaret", "bulut_teknolojileri", "veri_analitigi"],
    status: "active"
  }
];

// Diğer Kurumlar
const otherPrograms = [
  {
    program_code: "SANTEZ-2025",
    institution: "SANTEZ",
    program_name: "Sanayi Tezleri Programı",
    program_title: "SANTEZ Sanayi Tezleri",
    description: "Lisansüstü öğrencilerin sanayi odaklı tez projelerini destekler.",
    objectives: ["Akademi-sanayi işbirliği", "Uygulamalı araştırma"],
    target_sectors: ["imalat", "teknoloji"],
    eligible_applicants: ["lisansustu_ogrenciler"],
    min_budget: 30000,
    max_budget: 150000,
    funding_rate: 100,
    min_duration_months: 12,
    max_duration_months: 24,
    status: "active"
  },

  {
    program_code: "TEYDEB-STARTUP-2025",
    institution: "TEYDEB",
    program_name: "Teknoloji ve Yenilik Destekleme Programı",
    program_title: "TEYDEB Startup Desteği",
    description: "Teknoloji tabanlı startup'ların desteklenmesi.",
    objectives: ["Teknoloji girişimciliği", "Startup ekosistemi"],
    target_sectors: ["teknoloji"],
    eligible_applicants: ["startuplar", "teknoloji_sirketleri"],
    min_budget: 250000,
    max_budget: 1500000,
    funding_rate: 75,
    min_duration_months: 18,
    max_duration_months: 36,
    priority_areas: ["yapay_zeka", "fintech", "healthtech", "edtech"],
    status: "active"
  }
];

// Seed fonksiyonu
const seedGrantPrograms = async () => {
  try {
    console.log('🌱 Genişletilmiş hibe programları seed verisi ekleniyor...');
    
    const allPrograms = [
      ...ardebPrograms,
      ...teydebPrograms, 
      ...epdkPrograms,
      ...kosgebPrograms,
      ...otherPrograms
    ];
    
    for (const program of allPrograms) {
      const [created, wasCreated] = await GrantProgram.findOrCreate({
        where: { program_code: program.program_code },
        defaults: program
      });
      
      if (wasCreated) {
        console.log(`✅ Yeni program eklendi: ${program.program_code}`);
      }
    }
    
    console.log('✅ Tüm hibe programları başarıyla eklendi');
    console.log(`📊 Toplam ${allPrograms.length} program işlendi`);
    
    // Program sayısını kontrol et
    const totalCount = await GrantProgram.count();
    console.log(`📈 Veritabanında toplam ${totalCount} program`);
    
  } catch (error) {
    console.error('❌ Seed verisi ekleme hatası:', error.message);
  }
};

module.exports = { 
  seedGrantPrograms, 
  ardebPrograms, 
  teydebPrograms, 
  epdkPrograms, 
  kosgebPrograms, 
  otherPrograms 
};