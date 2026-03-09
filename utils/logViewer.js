import DatabaseLogger from "./databaseLogger.js";

class LogViewer {
  constructor() {
    this.databaseLogger = new DatabaseLogger();
    this.initialized = false;
  }

  async waitForInitialization() {
    if (this.initialized) return;
    
    // Počkáme na inicializáciu databázy
    let attempts = 0;
    while (attempts < 10) {
      try {
        await this.databaseLogger.getTestLogs(1);
        this.initialized = true;
        break;
      } catch (error) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    if (!this.initialized) {
      throw new Error('Nepodarilo sa inicializovať databázu');
    }
  }

  async showAllLogs(limit = 50) {
    try {
      await this.waitForInitialization();
      
      console.log(`🔍 Hľadám logy (limit: ${limit})...`);
      const logs = await this.databaseLogger.getTestLogs(limit);
      console.log(`📊 Našlo sa ${logs.length} logov`);
      console.log("\n📋 Všetky test logy:");
      console.log("=".repeat(80));

      if (logs.length === 0) {
        console.log('📭 Žiadne logy neboli nájdené.');
        return;
      }

      logs.forEach((log) => {
        const status = this.getStatusIcon(log.status);
        const duration = log.duration ? `${log.duration}s` : "N/A";
        console.log(
          `${status} ${log.test_name} | ${log.status} | ${duration} | ${log.start_time}`
        );

        if (log.error_message) {
          console.log(`   ❌ Chyba: ${log.error_message}`);
        }

        if (log.test_data) {
          try {
            const testData = JSON.parse(log.test_data);
            console.log(`   📋 Test data:`);
            if (testData.rodneCislo) {
              console.log(`      Rodné číslo: ${testData.rodneCislo}`);
            }
            if (testData.jmeno) {
              console.log(`      Jméno: ${testData.jmeno}`);
            }
            if (testData.prijmeni) {
              console.log(`      Příjmení: ${testData.prijmeni}`);
            }
          } catch (e) {
            // Ignorujeme chybu parsování
          }
        }
      });
    } catch (error) {
      console.error("Chyba pri načítaní logov:", error);
      throw error;
    }
  }

  async showFailedLogs(limit = 20) {
    try {
      const logs = await this.databaseLogger.getTestLogsByStatus(
        "failed",
        limit
      );
      console.log("\n❌ Zlyhané testy:");
      console.log("=".repeat(80));

      logs.forEach((log) => {
        console.log(`❌ ${log.test_name} | ${log.start_time}`);
        if (log.error_message) {
          console.log(`   Chyba: ${log.error_message}`);
        }
        if (log.test_data) {
          try {
            const testData = JSON.parse(log.test_data);
            if (testData.rodneCislo || testData.jmeno || testData.prijmeni) {
              console.log(`   📋 Test data: ${testData.rodneCislo || ''} ${testData.jmeno || ''} ${testData.prijmeni || ''}`);
            }
          } catch (e) {
            // Ignorujeme chybu parsování
          }
        }
      });
    } catch (error) {
      console.error("Chyba pri načítaní zlyhaných logov:", error);
    }
  }

  async showPassedLogs(limit = 20) {
    try {
      const logs = await this.databaseLogger.getTestLogsByStatus(
        "passed",
        limit
      );
      console.log("\n✅ Úspešné testy:");
      console.log("=".repeat(80));

      logs.forEach((log) => {
        const duration = log.duration ? `${log.duration}s` : "N/A";
        console.log(`✅ ${log.test_name} | ${duration} | ${log.start_time}`);
        if (log.test_data) {
          try {
            const testData = JSON.parse(log.test_data);
            if (testData.rodneCislo || testData.jmeno || testData.prijmeni) {
              console.log(`   📋 Test data: ${testData.rodneCislo || ''} ${testData.jmeno || ''} ${testData.prijmeni || ''}`);
            }
          } catch (e) {
            // Ignorujeme chybu parsování
          }
        }
      });
    } catch (error) {
      console.error("Chyba pri načítaní úspešných logov:", error);
    }
  }

  getStatusIcon(status) {
    switch (status) {
      case "passed":
        return "✅";
      case "failed":
        return "❌";
      case "skipped":
        return "⏭️";
      case "timedOut":
        return "⏰";
      default:
        return "❓";
    }
  }

  close() {
    this.databaseLogger.close();
  }
}

// CLI interface
async function main() {
  console.log('🚀 Spúšťam LogViewer...');
  console.log('Args:', process.argv.slice(2));
  
  const viewer = new LogViewer();
  const args = process.argv.slice(2);

  try {
    console.log('🔍 Načítavam logy z databázy...');
    
    switch (args[0]) {
      case "failed":
        console.log('📋 Zobrazujem zlyhané testy...');
        await viewer.showFailedLogs(parseInt(args[1]) || 20);
        break;
      case "passed":
        console.log('📋 Zobrazujem úspešné testy...');
        await viewer.showPassedLogs(parseInt(args[1]) || 20);
        break;
      default:
        console.log('📋 Zobrazujem všetky testy...');
        await viewer.showAllLogs(parseInt(args[0]) || 50);
    }
  } catch (error) {
    console.error("❌ Chyba pri načítaní logov:", error.message);
    console.error("Stack trace:", error.stack);
  } finally {
    console.log('🔒 Zatvaram databázu...');
    viewer.close();
  }
}

// Spustíme CLI ak je súbor spustený priamo
console.log('🔧 Kontrolujem či sa má spustiť main...');

// Zjednodušená podmienka - ak je súbor spustený priamo
if (process.argv[1] && process.argv[1].includes('logViewer.js')) {
  console.log('✅ Spúšťam main...');
  main();
} else {
  console.log('❌ Main sa nespúšťa');
}

export default LogViewer;
