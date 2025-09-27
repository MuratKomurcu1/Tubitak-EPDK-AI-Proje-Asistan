const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  conversation_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'conversations',
      key: 'id'
    }
  },
  
  sender_type: {
    type: DataTypes.ENUM,
    values: ['user', 'bot', 'system'],
    allowNull: false
  },
  
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  
  content_type: {
    type: DataTypes.ENUM,
    values: ['text', 'json', 'markdown', 'html'],
    defaultValue: 'text'
  },
  
  message_type: {
    type: DataTypes.ENUM,
    values: ['chat', 'analysis_result', 'suggestion', 'error', 'system_notification'],
    defaultValue: 'chat'
  },
  
  parent_message_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'messages',
      key: 'id'
    }
  },
  
  intent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  confidence_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 1
    }
  },
  
  processing_time_ms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  tokens_used: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  is_edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  edited_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'messages',
  timestamps: true,
  
  indexes: [
    {
      fields: ['conversation_id']
    },
    {
      fields: ['sender_type']
    },
    {
      fields: ['message_type']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Message;