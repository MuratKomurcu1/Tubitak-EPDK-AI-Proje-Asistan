const { sequelize } = require('../../config/database');

// Modelleri import et
const User = require('./User');
const Project = require('./Project');
const Conversation = require('./Conversation');
const Message = require('./Message');
const Analysis = require('./Analysis');
const GrantProgram = require('./GrantProgram'); // YENİ EKLENEN

// Model ilişkilerini tanımla

// User - Project ilişkisi (1:N)
User.hasMany(Project, {
  foreignKey: 'user_id',
  as: 'projects',
  onDelete: 'CASCADE'
});
Project.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// User - Conversation ilişkisi (1:N)
User.hasMany(Conversation, {
  foreignKey: 'user_id',
  as: 'conversations',
  onDelete: 'CASCADE'
});
Conversation.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Project - Conversation ilişkisi (1:N)
Project.hasMany(Conversation, {
  foreignKey: 'project_id',
  as: 'conversations',
  onDelete: 'SET NULL'
});
Conversation.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'project'
});

// Conversation - Message ilişkisi (1:N)
Conversation.hasMany(Message, {
  foreignKey: 'conversation_id',
  as: 'messages',
  onDelete: 'CASCADE'
});
Message.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation'
});

// Message - Message ilişkisi (Parent-Child)
Message.hasMany(Message, {
  foreignKey: 'parent_message_id',
  as: 'replies',
  onDelete: 'CASCADE'
});
Message.belongsTo(Message, {
  foreignKey: 'parent_message_id',
  as: 'parentMessage'
});

// Project - Analysis ilişkisi (1:N)
Project.hasMany(Analysis, {
  foreignKey: 'project_id',
  as: 'analyses',
  onDelete: 'CASCADE'
});
Analysis.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'project'
});

// Conversation - Analysis ilişkisi (1:N)
Conversation.hasMany(Analysis, {
  foreignKey: 'conversation_id',
  as: 'analyses',
  onDelete: 'SET NULL'
});
Analysis.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation'
});

// Veritabanı senkronizasyonu
const syncDatabase = async (force = false) => {
  try {
    console.log('📦 Veritabanı senkronizasyonu başlıyor...');
    
    if (force) {
      console.log('⚠️ UYARI: Tüm tablolar silinip yeniden oluşturulacak!');
    }
    
    await sequelize.sync({ force });
    
    console.log('✅ Veritabanı senkronizasyonu tamamlandı');
    console.log(`📊 Oluşturulan tablolar: users, projects, conversations, messages, analyses, grant_programs`);
    
  } catch (error) {
    console.error('❌ Veritabanı senkronizasyon hatası:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Project,
  Conversation,
  Message,
  Analysis,
  GrantProgram, // YENİ EKLENEN
  syncDatabase
};