import sqlite3 from "sqlite3";
import { promises as fs } from "fs";
import path from "path";

class DatabaseLogger {
  constructor() {
    this.dbPath = path.join(process.cwd(), "logs", "test_logs.db");
    this.db = null;
    this.initDatabase();
  }

  async initDatabase() {
    // Vytvoríme priečinok logs ak neexistuje
    const logsDir = path.dirname(this.dbPath);
    try {
      await fs.access(logsDir);
    } catch {
      await fs.mkdir(logsDir, { recursive: true });
    }

    // Synchronne otvoríme databázu
    this.db = new sqlite3.Database(this.dbPath);
    // Ticho - nechceme zobrazovat otevření databáze

    // Vytvoríme tabuľky ak neexistujú
    await this.createTables();
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      this.db.run(
        `
        CREATE TABLE IF NOT EXISTS test_runs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          test_name TEXT NOT NULL,
          status TEXT NOT NULL,
          start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          end_time DATETIME,
          duration INTEGER,
          error_message TEXT,
          screenshot_path TEXT,
          test_data TEXT
        )
      `,
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          // Přidáme sloupec test_data pokud neexistuje (migrace pro existující databáze)
          this.addColumnIfNotExists('test_runs', 'test_data', 'TEXT')
            .then(() => resolve())
            .catch(() => resolve()); // Ignorujeme chybu migrace, pokračujeme
        }
      );
    });
  }

  async addColumnIfNotExists(tableName, columnName, columnType) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `PRAGMA table_info(${tableName})`,
        (err, columns) => {
          if (err) {
            resolve(); // Ignorujeme chybu, sloupec možná už existuje
            return;
          }
          const columnExists = columns.some(col => col.name === columnName);
          if (!columnExists) {
            this.db.run(
              `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`,
              (alterErr) => {
                if (alterErr && !alterErr.message.includes('duplicate column')) {
                  reject(alterErr);
                } else {
                  resolve();
                }
              }
            );
          } else {
            resolve();
          }
        }
      );
    });
  }

  async logTestStart(testName) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO test_runs (test_name, status) VALUES (?, ?)",
        [testName, "running"],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async logTestEnd(
    testRunId,
    status,
    errorMessage = null,
    screenshotPath = null,
    testData = null
  ) {
    return new Promise((resolve, reject) => {
      const testDataJson = testData ? JSON.stringify(testData) : null;
      this.db.run(
        `UPDATE test_runs 
         SET status = ?, end_time = CURRENT_TIMESTAMP, 
             duration = (strftime('%s', 'now') - strftime('%s', start_time)),
             error_message = ?, screenshot_path = ?, test_data = ?
         WHERE id = ?`,
        [status, errorMessage, screenshotPath, testDataJson, testRunId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getTestLogs(limit = 100) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Databáza nie je inicializovaná'));
        return;
      }
      
      this.db.all(
        `SELECT * FROM test_runs 
         ORDER BY start_time DESC 
         LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async getTestLogsByStatus(status, limit = 100) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM test_runs 
         WHERE status = ? 
         ORDER BY start_time DESC 
         LIMIT ?`,
        [status, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

export default DatabaseLogger;
