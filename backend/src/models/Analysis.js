const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Analysis = sequelize.define('Analysis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  project_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  
  conversation_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'conversations',
      key: 'id'
    }
  },
  
  analysis_type: {
    type: DataTypes.ENUM,
    values: ['project_evaluation', 'similarity_check', 'program_matching', 'document_review', 'competitive_analysis'],
    allowNull: false
  },
  
  overall_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  innovation_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  feasibility_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  market_potential_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  technical_readiness_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  suitable_programs: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  
  recommendations: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  
  similar_projects: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  strengths: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  
  weaknesses: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  
  risk_factors: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  
  improvement_suggestions: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  
  estimated_success_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  confidence_level: {
    type: DataTypes.ENUM,
    values: ['low', 'medium', 'high'],
    defaultValue: 'medium'
  },
  
  analysis_duration_ms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  ai_model_used: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  tokens_consumed: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  status: {
    type: DataTypes.ENUM,
    values: ['processing', 'completed', 'failed', 'archived'],
    defaultValue: 'processing'
  },
  
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'analyses',
  timestamps: true,
  
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['analysis_type']
    },
    {
      fields: ['overall_score']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Analysis;