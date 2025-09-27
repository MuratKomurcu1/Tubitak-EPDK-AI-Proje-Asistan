const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const GrantProgram = sequelize.define('GrantProgram', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  program_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Örn: "1001", "1511", "EPDK-ARGE-2025"
  },
  
  institution: {
    type: DataTypes.ENUM,
    values: ['TUBITAK', 'EPDK', 'KOSGEB', 'TEYDEB', 'SANTEZ', 'ARDEB'],
    allowNull: false
  },
  
  program_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  program_title: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  objectives: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  
  target_sectors: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  
  eligible_applicants: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [] // ['universiteler', 'arastirma_kurumlari', 'sirketler']
  },
  
  min_budget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  
  max_budget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'TRY'
  },
  
  funding_rate: {
    type: DataTypes.DECIMAL(5, 2), // Yüzde olarak (0-100)
    allowNull: true
  },
  
  min_duration_months: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  max_duration_months: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  application_start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  application_end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  evaluation_criteria: {
    type: DataTypes.JSONB,
    defaultValue: {
      innovation: { weight: 25, description: "Yenilik düzeyi" },
      feasibility: { weight: 25, description: "Teknik fizibilite" },
      impact: { weight: 25, description: "Etki ve fayda" },
      team: { weight: 25, description: "Takım yetkinliği" }
    }
  },
  
  required_documents: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  
  keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  
  priority_areas: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  
  exclusion_criteria: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  
  success_metrics: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  
  contact_info: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  
  website_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  application_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  status: {
    type: DataTypes.ENUM,
    values: ['active', 'closed', 'upcoming', 'suspended'],
    defaultValue: 'active'
  },
  
  is_continuous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // Sürekli açık mı, yoksa dönemsel mi
  },
  
  historical_data: {
    type: DataTypes.JSONB,
    defaultValue: {
      total_applications: 0,
      approved_applications: 0,
      success_rate: 0,
      average_budget: 0
    }
  },
  
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'grant_programs',
  timestamps: true,
  
  indexes: [
    {
      unique: true,
      fields: ['program_code']
    },
    {
      fields: ['institution']
    },
    {
      fields: ['status']
    },
    {
      fields: ['target_sectors']
    },
    {
      fields: ['application_start_date', 'application_end_date']
    }
  ]
});

module.exports = GrantProgram;