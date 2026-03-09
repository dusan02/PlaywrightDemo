import { test, expect } from '@playwright/test';
import { setupGlobalHandlers } from '../utils/helpers.js';

/**
 * Vygeneruje platné rodné číslo (RČ) pre muža narodeného medzi 1960–1990.
 * Pridáva náhodný štvormiestny suffix, ktorý je deliteľný 11.
 */
function generateRC(sex: "M" | "F", yearFrom = 1960, yearTo = 1990): string {
  const year = getRandomInt(yearFrom, yearTo);
  const month = getRandomInt(1, 12);
  const day = getRandomInt(1, 28); // jednoduchšie kvôli mesiacom
  const twoDigitYear = year % 100;
  const monthValue = sex === "F" ? month + 50 : month;
  const datePart = pad(twoDigitYear, 2) + pad(monthValue, 2) + pad(day, 2);

  for (let i = 0; i < 10000; i++) {
    const suffix = pad(getRandomInt(0, 9999), 4);
    const rc = datePart + suffix;
    if (parseInt(rc, 10) % 11 === 0) {
      return `${datePart}/${suffix}`;
    }
  }
  throw new Error("Nepodarilo sa vygenerovať platné rodné číslo.");
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(num: number, size: number): string {
  return num.toString().padStart(size, "0");
}

test('test', async ({ page }) => {
  await setupGlobalHandlers(page);
  const rc = generateRC("M", 1960, 1962); // 🔧 generované RČ pre muža
  console.log("▶️   VOC s:", rc);

  await page.goto('http://vm-aisse:8081/ais-eo-fe/');
  await page.getByRole('button', { name: 'EO - Jiří Gregor (MV ČR)' }).click();
  await page.locator('ais-rodne-cislo').getByRole('textbox').fill('435202/129');

  await page.getByRole('textbox', { name: 'Důvod dotazu:' }).click();
  await page.getByRole('textbox', { name: 'Důvod dotazu:' }).fill('duvod1');
  await page.getByRole('button', { name: ' Vyhledat' }).click();
  await page.getByRole('cell', { name: '/129' }).dblclick();
  await page.locator('a').filter({ hasText: /^Oprava$/ }).hover();
  await page.getByRole('link', { name: 'Oprava dětí' }).click();
  await page.getByRole('textbox').click();

  // 💥 Tu vkladáme vygenerované rodné číslo
  await page.getByRole('textbox').fill(rc);

  await page.getByRole('button', { name: ' Vyhledat' }).click();
  await page.getByRole('button', { name: ' Nová vedlejší osoba' }).click();
  /*toto je checkbox rozdielu pre VOC = true, defaultne je true, 
  pre scenár VOC sa preskočí, pre scenár VO sa do checkboxu klikne
  await page.locator('#dite_novaVedlejsi_cizinec').click(); */

  await page.getByRole('textbox', { name: 'Příjmení:', exact: true }).click();
  await page.getByRole('textbox', { name: 'Příjmení:', exact: true }).fill('VOC');
  await page.getByRole('textbox', { name: 'Příjmení:', exact: true }).press('Tab');
  await page.getByRole('textbox', { name: 'Jméno:' }).fill('DAVID');
  await page.getByRole('button', { name: 'Potvrdit' }).click();
  await page.locator('#dite_novaVedlejsi_misto').click();
  await page.locator('#dite_novaVedlejsi_misto').fill('Test');
  await page.locator('#vedlejsi-osoba-oprava-mista-narozeni-misto div').filter({ hasText: 'Okres narození:' }).click();

  await page.getByRole('button', { name: 'Potvrdit' }).click();
});
