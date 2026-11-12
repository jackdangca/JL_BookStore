// db.js - Oracle 12c connection pool (node-oracledb thin mode, no Instant Client needed)
//
// Exposes initialize / query / callProcedure (+ an `oracledb` constants export).
// The route files (routes/books.js, routes/authors.js, routes/customers.js)
// and server.js were written for this driver and need no changes.
// Connection settings come from backend/.env (see backend/.env.example).
const oracledb = require('oracledb');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

oracledb.autoCommit = false; // procedures/queries manage commit explicitly

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XEPDB1',
  poolMin: 1,
  poolMax: 5,
  poolIncrement: 1,
};

async function initialize() {
  await oracledb.createPool(dbConfig);
  console.log(`[db] Oracle connection pool created -> ${dbConfig.connectString}`);
}

// Run a PL/SQL block (stored procedure call) with bind variables
async function callProcedure(plsql, binds) {
  const connection = await oracledb.getConnection();
  try {
    const result = await connection.execute(plsql, binds, { autoCommit: false });
    // procedures already COMMIT internally; nothing extra needed
    return result;
  } finally {
    await connection.close();
  }
}

// Run a SELECT and return rows as plain objects
async function query(sql, binds = []) {
  const connection = await oracledb.getConnection();
  try {
    const result = await connection.execute(
      sql, binds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } finally {
    await connection.close();
  }
}

module.exports = { initialize, callProcedure, query, oracledb };
