import DatabaseLogger from './databaseLogger.js';

class TestLogger {
  constructor() {
    this.databaseLogger = new DatabaseLogger();
  }

  async logTestStart(testName) {
    // Ticho - nechceme zobrazovat start testu
    return await this.databaseLogger.logTestStart(testName);
  }

  /**
   * @param {number|string} testRunId
   * @param {'passed'|'failed'|string} status
   * @param {string|null} [errorMessage=null]
   * @param {string|null} [screenshotPath=null]
   * @param {any|null} [testData=null]
   */
  async logTestEnd(testRunId, status, errorMessage = null, screenshotPath = null, testData = null) {
    if (status === 'passed' && testData) {
      // Zjednodušený výstup: jen Test passed a data
      const parts = [];
      if (testData.rodneCislo) parts.push(`RČ: ${testData.rodneCislo}`);
      if (testData.jmeno) parts.push(`Jméno: ${testData.jmeno}`);
      if (testData.prijmeni) parts.push(`Příjmení: ${testData.prijmeni}`);

      if (parts.length > 0) {
        console.log(`Test passed - ${parts.join(', ')}`);
      } else {
        console.log(`Test passed`);
      }
    } else if (status === 'failed') {
      console.log(`Test failed${errorMessage ? `: ${errorMessage}` : ''}`);
    } else {
      console.log(`Test ${status}`);
    }

    await this.databaseLogger.logTestEnd(testRunId, status, errorMessage, screenshotPath, testData);
  }

  async getLogs(limit = 50) {
    return await this.databaseLogger.getTestLogs(limit);
  }

  async getFailedLogs(limit = 20) {
    return await this.databaseLogger.getTestLogsByStatus('failed', limit);
  }

  async getPassedLogs(limit = 20) {
    return await this.databaseLogger.getTestLogsByStatus('passed', limit);
  }

  close() {
    this.databaseLogger.close();
  }
}

// Singleton instance
const testLogger = new TestLogger();

export default testLogger; 