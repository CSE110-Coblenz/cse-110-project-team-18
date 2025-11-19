import Database from 'better-sqlite3';
const db = new Database('data/game_data.db');

db.pragma('journal_mode = WAL'); // Enable Write-Ahead Logging for better concurrency
db.pragma('foreign_keys = ON'); // Enforce foreign key constraints

export default db;
