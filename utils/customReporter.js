import DatabaseLogger from "./databaseLogger.js";

class CustomReporter {
  constructor(options = {}) {
    this.databaseLogger = new DatabaseLogger();
    this.testRuns = new Map();
  }

  onBegin(config, suite) {
    console.log(`🚀 Spúšťam testy s custom reporterom`);
  }

  onTestBegin(test, result) {
    const testName = test.title;
    console.log(`▶️  Začínam test: ${testName}`);

    // Uložíme ID testu pre sledovanie
    this.testRuns.set(test.id, {
      testName,
      startTime: Date.now(),
    });
  }

  onTestEnd(test, result) {
    const testRun = this.testRuns.get(test.id);
    if (!testRun) return;

    const status = result.status;
    const errorMessage = result.error ? result.error.message : null;

    console.log(`✅ Test dokončený: ${testRun.testName} - ${status}`);

    // Uložíme výsledok do databázy
    this.databaseLogger.logTestEnd(
      test.id,
      status,
      errorMessage,
      result.attachments?.find((a) => a.name === "screenshot")?.path || null
    );

    this.testRuns.delete(test.id);
  }

  onEnd(result) {
    console.log(`🏁 Všetky testy dokončené. Celkový čas: ${result.duration}ms`);
    console.log(`📊 Výsledky: ${result.status}`);

    // Zatvoríme databázu
    this.databaseLogger.close();
  }

  onError(error) {
    console.error(`❌ Chyba v reporteri:`, error);
  }
}

export default CustomReporter;
