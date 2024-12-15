
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { app } = require('electron');
const path = require('path');

class CaptureDatabase {
  constructor() {
    this.db = null;
    this.dbPath = path.join(app.getPath('userData'), 'captures.db');
  }

  async initialize() {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS captures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        voltage REAL NOT NULL,
        current REAL NOT NULL,
        power REAL NOT NULL,
        output_enabled INTEGER NOT NULL,
        ovp INTEGER NOT NULL,
        ocp INTEGER NOT NULL,
        opp INTEGER NOT NULL,
        otp INTEGER NOT NULL,
        scp INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_timestamp ON captures(timestamp);
    `);
  }

  async addMeasurement(measurement) {
    return this.db.run(`
      INSERT INTO captures (
        timestamp, voltage, current, power,
        output_enabled, ovp, ocp, opp, otp, scp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      measurement.timestamp,
      measurement.voltage,
      measurement.current,
      measurement.power,
      measurement.outputEnabled ? 1 : 0,
      measurement.protectionStatus.OVP ? 1 : 0,
      measurement.protectionStatus.OCP ? 1 : 0,
      measurement.protectionStatus.OPP ? 1 : 0,
      measurement.protectionStatus.OTP ? 1 : 0,
      measurement.protectionStatus.SCP ? 1 : 0
    ]);
  }

  async getRecentMeasurements(since) {
    return this.db.all(`
      SELECT * FROM captures 
      WHERE timestamp > ? 
      ORDER BY timestamp ASC
    `, [since]);
  }

  async clearCaptures() {
    return this.db.run('DELETE FROM captures');
  }
}

export { CaptureDatabase };