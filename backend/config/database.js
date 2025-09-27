const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER, 
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgresql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Veritabanı bağlantısı başarılı');
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error.message);
  }
};

module.exports = { sequelize, testConnection };