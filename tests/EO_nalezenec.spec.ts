import { test, expect } from '@playwright/test';
import testLogger from '../utils/testLogger.js';
import { EoNalezenecPage } from '../POM/EoNalezenecPage.js';
import { setupGlobalHandlers } from '../utils/helpers.js';

const testNalezenci = [
  {
    rodneCislo: '881009/0608',
    jmeno: 'Lucie',
    prijmeni: 'Nová',
    obecNazev: 'BRNO (Brno-město)',
    mestskaCastNazev: 'Brno-Bohunice',
    duvodDotazu: 'test1'
  }
];

for (const data of testNalezenci) {
  test(`EO nalezenec - ${data.rodneCislo}`, async ({ page }) => {
    await setupGlobalHandlers(page);
    const testRunId = await testLogger.logTestStart(`EO nalezenec - ${data.rodneCislo}`);

    try {
      const eoNalezenecPage = new EoNalezenecPage(page);

      // Metóda createNalezenec z POM už vo vnútri volá navigate() a login(), 
      // takže vynechaním ich vonkajšieho volania sa zbavíme nadbytočných krokov.
      await eoNalezenecPage.createNalezenec(data);

      const testData = eoNalezenecPage.getTestData();

      // Základné assertion, ideálne zmeň na reálne čakanie viditeľnosti success modalu/toastu.
      expect(testData.rodneCislo).toBe(data.rodneCislo);

      await testLogger.logTestEnd(testRunId, 'passed', null, null, testData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const testData = { rodneCislo: data.rodneCislo };
      await testLogger.logTestEnd(testRunId, 'failed', errorMessage, null, testData);
      throw error;
    }
  });
}
