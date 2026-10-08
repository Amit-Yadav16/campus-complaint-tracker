/**
 * db.js — JSON file read/write utility
 * Thin wrapper that makes it easy to swap JSON storage for MongoDB/PostgreSQL later.
 * All data access goes through these helpers — never read/write JSON files directly in routes.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

/**
 * Read a JSON data file.
 * @param {string} fileName - e.g. 'complaints'
 * @returns {Array|Object}
 */
function readData(fileName) {
  const filePath = path.join(DATA_DIR, `${fileName}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[db] Failed to read ${fileName}.json:`, err.message);
    return [];
  }
}

/**
 * Write data to a JSON file.
 * @param {string} fileName - e.g. 'complaints'
 * @param {Array|Object} data
 */
function writeData(fileName, data) {
  const filePath = path.join(DATA_DIR, `${fileName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readData, writeData };
