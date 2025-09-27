const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true // Şimdilik opsiyonel
  },
  
  company: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  sector: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'users',
  timestamps: true,
  
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ]
});

module.exports = User;