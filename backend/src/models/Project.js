const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 200]
    }
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 5000]
    }
  },
  
  sector: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['enerji', 'teknoloji', 'saglik', 'tarim', 'egitim', 'finans', 'imalat', 'hizmet', 'diger']]
    }
  },
  
  budget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  
  budget_currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'TRY'
  },
  
  project_stage: {
    type: DataTypes.ENUM,
    values: ['fikir', 'prototip', 'pilot', 'urun', 'pazar'],
    defaultValue: 'fikir'
  },
  
  target_programs: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  
  keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  
  team_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 100
    }
  },
  
  duration_months: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 60
    }
  },
  
  innovation_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  
  market_potential: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  
  technical_readiness: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 9
    }
  },
  
  status: {
    type: DataTypes.ENUM,
    values: ['draft', 'analyzing', 'ready', 'submitted', 'approved', 'rejected'],
    defaultValue: 'draft'
  },
  
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'projects',
  timestamps: true,
  
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['sector']
    },
    {
      fields: ['project_stage']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Project;