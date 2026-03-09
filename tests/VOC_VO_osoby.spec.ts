import { test, expect } from '@playwright/test'
import { setupGlobalHandlers } from '../utils/helpers.js'

/* ----------  UTILITA NA GENEROVANIE RČ  ---------- */
const usedRCs = new Set<string>();

function generateUniqueRC(sex: 'M' | 'F', yearFrom = 1960, yearTo = 1990): string {
  while (true) {
    const rc = generateRC(sex, yearFrom, yearTo);
    if (!usedRCs.has(rc)) {
      usedRCs.add(rc);
      return rc;
    }
  }
}

function generateRC(sex: 'M' | 'F', yearFrom: number, yearTo: number): string {
  const year = rand(yearFrom, yearTo);
  const month = rand(1, 12);
  const day = rand(1, 28); // jednoduchšie
  const twoDigitYear = year % 100;
  const monthValue = sex === 'F' ? month + 50 : month;
  const datePart = pad(twoDigitYear, 2) + pad(monthValue, 2) + pad(day, 2);

  for (let i = 0; i < 10_000; i++) {
    const suffix = pad(rand(0, 9999), 4);
    const rcRaw = datePart + suffix;
    if (Number(rcRaw) % 11 === 0) return `${datePart}/${suffix}`;
  }
  throw new Error('Nepodarilo sa vygenerovať platné rodné číslo.');
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (n: number, len: number) => n.toString().padStart(len, '0');

/* ----------  TESTY BEŽIACE PARALELNE  ---------- */
test.describe.parallel('Oprava detí – VO & VOC', () => {
  test.beforeEach(async ({ page }) => {
    await setupGlobalHandlers(page);
  });

  test('VO scenár', async ({ page }) => {
    const rc = generateUniqueRC('M');
    console.log(`VO s RC ${rc}`);
    //rel
    await page.goto('http://vm-aisse:8081/jip-kaas/login?atsId=EO');
    //await page.goto('http://vm-aisse:8082/ais-eo-fe/');
    await page.getByRole('button', { name: 'EO - Jiří Gregor (MV ČR)' }).click();

    await page.locator('ais-rodne-cislo').getByRole('textbox').fill('435525/946');
    await page.getByRole('textbox', { name: 'Důvod dotazu:' }).fill('duvod1');
    await page.getByRole('button', { name: ' Vyhledat' }).click();
    await page.getByRole('cell', { name: '/946' }).dblclick();
    await page.locator('a').filter({ hasText: /^Oprava$/ }).hover();
    await page.getByRole('link', { name: 'Oprava dětí' }).click();
    await page.getByRole('textbox').fill(rc);
    await page.getByRole('button', { name: ' Vyhledat' }).click();
    await page.getByRole('button', { name: ' Nová vedlejší osoba' }).click();
    await page.locator('#dite_novaVedlejsi_cizinec').click();
    await page.getByRole('textbox', { name: 'Příjmení:', exact: true }).fill('VO');
    await page.getByRole('textbox', { name: 'Příjmení:', exact: true }).press('Tab');
    await page.getByRole('textbox', { name: 'Jméno:' }).fill('Martin');
    await page.getByRole('button', { name: 'Potvrdit' }).click();
  });

  test('VOC scenár', async ({ page }) => {
    const rc = generateUniqueRC('M');
    console.log(`VOC s RC ${rc}`);

    await page.goto('http://vm-aisse:8083/jip-kaas/login?atsId=EO');
    await page.getByRole('button', { name: 'EO - Jiří Gregor (MV ČR)' }).click();

    await page.locator('ais-rodne-cislo').getByRole('textbox').fill('905422/1176');

    await page.getByRole('textbox', { name: 'Důvod dotazu:' }).fill('duvod1');
    await page.getByRole('button', { name: ' Vyhledat' }).click();
    //await page.getByRole('cell', { name: 'SVATOŠOVÁ' }).dblclick();
    //await page.getByRole('cell', { name: 'POLÁKOVÁ' }).dblclick();
    await page.getByRole('cell', { name: '/1176' }).dblclick();
    await page.locator('a').filter({ hasText: /^Oprava$/ }).hover();
    await page.getByRole('link', { name: 'Oprava dětí' }).click();
    await page.getByRole('textbox').fill(rc);
    await page.getByRole('button', { name: ' Vyhledat' }).click();
    await page.getByRole('button', { name: ' Nová vedlejší osoba' }).click();

    await page.getByRole('textbox', { name: 'Příjmení:', exact: true }).fill('VOC');
    await page.getByRole('textbox', { name: 'Příjmení:', exact: true }).press('Tab');
    await page.getByRole('textbox', { name: 'Jméno:' }).fill('DAVID');
    await page.getByRole('button', { name: 'Potvrdit' }).click();

    // Výber štátu narodenia (Belize)
    await page.locator('#dite_novaVedlejsi_statKod').getByRole('combobox').click();
    const birthCountrySearchbox = page.getByRole('searchbox');
    await expect(birthCountrySearchbox).toBeVisible();
    await birthCountrySearchbox.fill('Belize');
    await page.getByRole('option', { name: 'Belize' }).locator('div').click();

    // Miesto narodenia
    await page.locator('#dite_novaVedlejsi_misto').fill('Belmopan');

    // ⏳ Počkaj, kým sa zavrie predchádzajúci dropdown
    await page.waitForTimeout(500);

    // Výber štátnej príslušnosti (Aruba)
    const statPrislusnostDropdown = page.locator('#dite_novaVedlejsi_statniPrislusnost');
    await statPrislusnostDropdown.getByRole('combobox').click();
    const nationalitySearchbox = statPrislusnostDropdown.getByRole('searchbox');
    await expect(nationalitySearchbox).toBeVisible();
    await nationalitySearchbox.fill('Aruba');
    await page.getByRole('option', { name: 'Aruba' }).nth(0).click();

    // Potvrdenie výberu
    await page.getByRole('button', { name: 'Potvrdit' }).click();
  });

});
