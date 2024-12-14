import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { app } from 'electron';

let db;

export async function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'measurements.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      voltage REAL NOT NULL,
      current REAL NOT NULL,
      temperature REAL,
      mode TEXT,
      output_enabled INTEGER,
      protection_status TEXT,
      regulation_mode TEXT
    )
  `);
}

export async function storeMeasurement(measurement) {
  const stmt = await db.prepare(`
    INSERT INTO measurements (
      voltage, current, temperature, mode, 
      output_enabled, protection_status, regulation_mode
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  await stmt.run(
    measurement.voltage,
    measurement.current,
    measurement.temperature,
    measurement.mode,
    measurement.outputEnabled ? 1 : 0,
    measurement.protectionStatus,
    measurement.regulationMode
  );
}

export async function getRecentMeasurements(minutes = 60) {
  const measurements = await db.all(`
    SELECT 
      strftime('%Y-%m-%dT%H:%M:%SZ', timestamp) as timestamp,
      voltage,
      current,
      temperature,
      mode,
      output_enabled as outputEnabled,
      protection_status as protectionStatus,
      regulation_mode as regulationMode
    FROM measurements 
    WHERE timestamp > datetime('now', '-' || ? || ' minutes')
    ORDER BY timestamp ASC
  `, minutes);

  return measurements.map(m => ({
    ...m,
    outputEnabled: Boolean(m.outputEnabled)
  }));
}

module.exports = {
  initDatabase,
  storeMeasurement,
  getRecentMeasurements
} 