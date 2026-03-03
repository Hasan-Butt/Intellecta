const sql = require('mssql');
console.log("DB_SERVER:", process.env.DB_SERVER);
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

const connectDB = async () => {
  try {
    pool = await sql.connect(config);
    console.log('✅ SQL Server connected successfully');
    return pool;
  } catch (err) {
    console.error('❌ SQL Server connection error:', err);
    process.exit(1);
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return pool;
};

module.exports = { connectDB, getPool, sql };