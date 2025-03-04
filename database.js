const sql = require('mssql');
const path = require('path');
const encryption = require('./encryption');

// Update these values for your SQL Express instance
const config = {
  user: 'your_username',         // Replace with your SQL Express username
  password: 'your_password',     // Replace with your SQL Express password
  server: 'localhost',
  database: 'visitorDB',         // Ensure this database exists in your instance
  options: {
    instanceName: 'SQLEXPRESS',
    encrypt: false,
    trustServerCertificate: true
  }
};

let pool;

/**
 * Connects to the database and ensures that required tables exist.
 */
async function initialize() {
  try {
    pool = await sql.connect(config);
    console.log("Connected to Microsoft SQL Express.");
    await createTables();
  } catch (err) {
    console.error("Database connection failed: ", err);
  }
}

/**
 * Creates the required tables if they do not already exist.
 */
async function createTables() {
  const createVisitorsTable = `
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[visitors]') AND type in (N'U'))
    BEGIN
      CREATE TABLE [dbo].[visitors] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [nric] NVARCHAR(255),
        [name] NVARCHAR(255),
        [visit_date] DATETIME,
        [data] NVARCHAR(MAX)
      )
    END
  `;
  const createLogsTable = `
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[logs]') AND type in (N'U'))
    BEGIN
      CREATE TABLE [dbo].[logs] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [visitor_id] INT,
        [action] NVARCHAR(10), -- "IN" or "OUT"
        [timestamp] DATETIME,
        CONSTRAINT FK_Visitor_Log FOREIGN KEY(visitor_id) REFERENCES visitors(id)
      )
    END
  `;
  try {
    await pool.request().query(createVisitorsTable);
    await pool.request().query(createLogsTable);
    console.log("Tables are ready.");
  } catch (err) {
    console.error("Error creating tables: ", err);
  }
}

/**
 * Adds a visitor record with encrypted details.
 * @param {Object} visitorData - Must contain nric, name, and optionally extra.
 * @returns {Promise<number>} The new visitor's ID.
 */
async function addVisitor(visitorData) {
  const encryptedNRIC = encryption.encrypt(visitorData.nric);
  const encryptedName = encryption.encrypt(visitorData.name);
  const now = new Date();
  const extraData = encryption.encrypt(JSON.stringify(visitorData.extra || {}));
  const query = `
    INSERT INTO [dbo].[visitors] (nric, name, visit_date, data)
    VALUES (@nric, @name, @visit_date, @data);
    SELECT SCOPE_IDENTITY() AS visitorId;
  `;
  try {
    const result = await pool.request()
      .input('nric', sql.NVarChar(255), encryptedNRIC)
      .input('name', sql.NVarChar(255), encryptedName)
      .input('visit_date', sql.DateTime, now)
      .input('data', sql.NVarChar(sql.MAX), extraData)
      .query(query);
    return result.recordset[0].visitorId;
  } catch (err) {
    throw err;
  }
}

/**
 * Adds a log entry for visitor IN/OUT events.
 * @param {number} visitorId - The ID of the visitor.
 * @param {string} action - "IN" or "OUT".
 */
async function addLog(visitorId, action) {
  const now = new Date();
  const query = `
    INSERT INTO [dbo].[logs] (visitor_id, action, timestamp)
    VALUES (@visitor_id, @action, @timestamp);
  `;
  try {
    await pool.request()
      .input('visitor_id', sql.Int, visitorId)
      .input('action', sql.NVarChar(10), action)
      .input('timestamp', sql.DateTime, now)
      .query(query);
  } catch (err) {
    throw err;
  }
}

/**
 * Retrieves logs. If a search query is provided, filters by visitor_id or action.
 * @param {string} searchQuery - Optional search filter.
 * @returns {Promise<Array>} Array of log records.
 */
async function getLogs(searchQuery) {
  let query;
  if (searchQuery && searchQuery.trim() !== "") {
    query = `
      SELECT * FROM [dbo].[logs]
      WHERE CAST(visitor_id AS NVARCHAR(50)) LIKE @search OR action LIKE @search
      ORDER BY timestamp DESC
    `;
  } else {
    query = `SELECT * FROM [dbo].[logs] ORDER BY timestamp DESC`;
  }
  try {
    const request = pool.request();
    if (searchQuery && searchQuery.trim() !== "") {
      request.input('search', sql.NVarChar(50), '%' + searchQuery + '%');
    }
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

/**
 * Cleans up visitor records that are expired. A record is considered expired
 * if the visitor's last visit date is more than 3 months before the current date.
 */
async function cleanupExpiredVisitors() {
  const query = `
    DELETE FROM [dbo].[visitors]
    WHERE visit_date < DATEADD(MONTH, -3, GETDATE());
  `;
  try {
    const result = await pool.request().query(query);
    console.log("Expired visitor records cleaned up.");
  } catch (err) {
    console.error("Error cleaning up expired visitors:", err);
  }
}

module.exports = {
  initialize,
  addVisitor,
  addLog,
  getLogs,
  cleanupExpiredVisitors
};
