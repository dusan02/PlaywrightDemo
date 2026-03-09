import { test, expect } from '@playwright/test';
import testLogger from '../utils/testLogger.js';
import { EoNarozeniPage } from '../POM/EoNarozeniPage.js';
import { generateNarozeniTestData, setupGlobalHandlers } from '../utils/helpers.js';
import { RCService } from '../utils/rcService.js';
import { decodeRC } from '../utils/rcGenerator.js';

test('EO osoba - narození', async ({ page }) => {
  await setupGlobalHandlers(page);
  const testRunId = await testLogger.logTestStart('EO osoba - narození');

  // Generování test dat pomocí helper funkce
  const { rodneCislo, jmeno, prijmeni } = generateNarozeniTestData(2000, 2002, 'M', 5, 5);

  // Dekódování rodného čísla pro logování
  const decoded = decodeRC(rodneCislo);
  const birthYear = decoded.year;
  const sex = decoded.sex as 'M' | 'F';

  // Výpis informací o rodném čísle (stejný formát jako EO_nova_osoba.spec.ts)
  RCService.logRCInfo(rodneCislo, decoded, birthYear, sex, jmeno, prijmeni);

  try {
    const eoNarozeniPage = new EoNarozeniPage(page);

    // Fluent API - kompletní workflow pomocí createNarozeni
    await eoNarozeniPage
      .navigate()
      .then(page => page.openEOApp())
      .then(page => page.createNarozeni({
        rodneCislo,
        jmeno,
        prijmeni,
        matkaDatumNarozeni: '22.04.1990',
        matkaPrijmeni: 'po*',
        matkaCellContent: '/1176',
        obecNazev: 'BENEŠOV (Benešov)',
        duvodDotazu: 'test'
      }));

    // Uložení test dat do logu
    const testData = eoNarozeniPage.getTestData();
    await testLogger.logTestEnd(testRunId, 'passed', null, null, testData as any);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const testData = {
      rodneCislo: rodneCislo,
      jmeno: jmeno,
      prijmeni: prijmeni
    };
    await testLogger.logTestEnd(testRunId, 'failed', errorMessage as any, null, testData as any);
    throw error;
  }
});

