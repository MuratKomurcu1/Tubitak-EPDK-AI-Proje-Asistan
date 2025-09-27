const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  user_id: {
    type: DataTypes.UUID,
    allowNull: true, // Anonim kullanıcılar için
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  session_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  
  title: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Yeni Sohbet'
  },
  
  project_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  
  status: {
    type: DataTypes.ENUM,
    values: ['active', 'completed', 'archived'],
    defaultValue: 'active'
  },
  
  conversation_type: {
    type: DataTypes.ENUM,
    values: ['project_consultation', 'general_help', 'document_preparation', 'analysis_review'],
    defaultValue: 'general_help'
  },
  
  last_activity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  
  message_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['session_id']
    },
    {
      fields: ['project_id']
    },
    {
      fields: ['last_activity']
    }
  ]
});

module.exports = Conversation;