'use strict';

/**
 * initializeDatabase.js
 *
 * Reads server/database/init.sql and executes every statement against the
 * configured MySQL database.  The script is idempotent: every CREATE TABLE
 * uses IF NOT EXISTS and every seed INSERT uses a WHERE NOT EXISTS guard, so
 * running it on a database that already has data is completely safe.
 *
 * Called automatically from server/models/database.js on startup.
 */

const fs   = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SQL_FILE = path.join(__dirname, '..', 'database', 'init.sql');

/**
 * Split a raw SQL file into individual statements.
 * Handles:
 *  - single-line (--) and multi-line (/* … *\/) comments
 *  - string literals that may contain semicolons
 *  - DELIMITER-less dumps (standard phpMyAdmin output)
 */
function splitStatements(sql) {
  // Strip block comments
  sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');

  const statements = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inLineComment = false;

  for (let i = 0; i < sql.length; i++) {
    const ch  = sql[i];
    const next = sql[i + 1];

    // Track line comments
    if (!inSingleQuote && !inDoubleQuote && ch === '-' && next === '-') {
      inLineComment = true;
    }
    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      else continue; // skip comment characters
    }

    // Track string literals
    if (ch === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
    if (ch === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;

    // Statement terminator
    if (ch === ';' && !inSingleQuote && !inDoubleQuote) {
      const stmt = current.trim();
      if (stmt.length > 0) statements.push(stmt);
      current = '';
      continue;
    }

    current += ch;
  }

  // Catch any trailing statement without a semicolon
  const last = current.trim();
  if (last.length > 0) statements.push(last);

  return statements;
}

async function initializeDatabase() {
  // Verify the SQL file exists before attempting a connection
  if (!fs.existsSync(SQL_FILE)) {
    console.warn('[DB Init] init.sql not found at', SQL_FILE, '— skipping initialisation.');
    return;
  }

  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'dharti_oil',
    multipleStatements: false, // execute one at a time for clear error reporting
  });

  console.log('[DB Init] Connected — running init.sql …');

  const raw        = fs.readFileSync(SQL_FILE, 'utf8');
  const statements = splitStatements(raw);

  let executed = 0;
  let skipped  = 0;

  for (const stmt of statements) {
    // Skip pure comment blocks or empty strings that slipped through
    if (!stmt || /^--/.test(stmt)) { skipped++; continue; }

    try {
      await connection.execute(stmt);
      executed++;
    } catch (err) {
      // ER_TABLE_EXISTS_ERROR (1050) and ER_DUP_ENTRY (1062) are expected on
      // subsequent startups — log a warning but do not abort.
      if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.errno === 1050) {
        skipped++;
      } else if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
        skipped++;
      } else {
        console.error('[DB Init] Statement failed:\n', stmt, '\nError:', err.message);
        // Continue with remaining statements rather than crashing the server
      }
    }
  }

  await connection.end();
  console.log(`[DB Init] Done — ${executed} statement(s) executed, ${skipped} skipped.`);
}

module.exports = initializeDatabase;
