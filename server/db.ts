import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('quantpulse.db');
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
  CREATE TABLE IF NOT EXISTS watchlist (
    ticker TEXT PRIMARY KEY,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS signal_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT,
    date TEXT,
    score INTEGER,
    label TEXT,
    priceAtSignal REAL,
    signal_text TEXT,
    analysis_id TEXT UNIQUE,
    model_version TEXT,
    formula_version TEXT,
    weight_profile TEXT,
    market_regime TEXT,
    composite_score INTEGER,
    confidence_score INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS street_sheet_cache (
    ticker TEXT PRIMARY KEY,
    data_json TEXT,
    fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export function getWatchlist() {
  return db.prepare('SELECT * FROM watchlist ORDER BY added_at DESC').all();
}

export function addWatchlist(ticker: string) {
  const stmt = db.prepare('INSERT OR IGNORE INTO watchlist (ticker) VALUES (?)');
  stmt.run(ticker);
}

export function removeWatchlist(ticker: string) {
  const stmt = db.prepare('DELETE FROM watchlist WHERE ticker = ?');
  stmt.run(ticker);
}

export function getStreetSheetCache(ticker: string) {
  const row = db.prepare('SELECT data_json, fetched_at FROM street_sheet_cache WHERE ticker = ?').get(ticker) as { data_json: string, fetched_at: string } | undefined;
  if (!row) return null;
  try {
    return JSON.parse(row.data_json);
  } catch (e) {
    return null;
  }
}

export function saveStreetSheetCache(data: any) {
  const stmt = db.prepare('INSERT OR REPLACE INTO street_sheet_cache (ticker, data_json, fetched_at) VALUES (?, ?, ?)');
  stmt.run(data.ticker, JSON.stringify(data), data.fetchedAt || new Date().toISOString());
}

export default db;
