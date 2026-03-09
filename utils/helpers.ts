import { Page } from '@playwright/test';
import { RCService, RCConfig } from './rcService';

/**
 * Vygeneruje platné rodné číslo (RČ) podľa pravidiel pre SR/ČR.
 * Pridáva časovú entropiu, aby bolo RČ unikátne pre každý test.
 * @param sex "M" alebo "F"
 * @param yearFrom minimálny rok narodenia
 * @param yearTo maximálny rok narodenia
 * @returns rodné číslo vo formáte "YYMMDD/XXXX"
 */
export function generateRC(sex: "M" | "F", yearFrom = 1950, yearTo = 1989): string {
  const year = getRandomInt(yearFrom, yearTo);
  const month = getRandomInt(1, 12);
  const day = getRandomInt(1, 28); // Bezpečné rozpätie dní

  const twoDigitYear = year % 100;
  const monthValue = sex === "F" ? month + 50 : month;
  const datePart = pad(twoDigitYear, 2) + pad(monthValue, 2) + pad(day, 2);

  // Získaj časovú entropiu – sekundy od polnoci
  const now = new Date();
  const timeMs =
    now.getHours() * 3600000 +
    now.getMinutes() * 60000 +
    now.getSeconds() * 1000 +
    now.getMilliseconds();

  const baseSuffix = timeMs % 10000; // 0000 až 9999

  // Najprv skús od baseSuffix po 9999
  for (let i = baseSuffix; i < 10000; i++) {
    const suffix = pad(i, 4);
    const rc = datePart + suffix;
    if (parseInt(rc, 10) % 11 === 0) {
      return `${datePart}/${suffix}`;
    }
  }

  // Potom skús od 0000 po baseSuffix-1
  for (let i = 0; i < baseSuffix; i++) {
    const suffix = pad(i, 4);
    const rc = datePart + suffix;
    if (parseInt(rc, 10) % 11 === 0) {
      return `${datePart}/${suffix}`;
    }
  }

  throw new Error("❌ Nepodarilo sa vygenerovať platné a unikátne rodné číslo.");
}

/**
 * Klikne na element, ak sa objaví v danom časovom limite a nevytvorí chybu ak tam nie je.
 */
export async function clickIfAppears(page: Page, selector: string, timeout = 10000) {
  try {
    const element = page.locator(selector);
    await element.waitFor({ state: "visible", timeout });
    await element.click();
  } catch (e) {
    // Element sa nemusel objaviť – nevadí
  }
}

/**
 * Nastaví globálne handlery pre automatické odklikávanie vyskakovacích okien na pozadí.
 */
export async function setupGlobalHandlers(page: Page) {
  // Handler pre tlačidlo "Ano" (položka doplnená) cez ID
  // Používame .first() pre prípad, že by ich bolo viac naraz
  await page.addLocatorHandler(page.locator('#err-button-confirm').first(), async () => {
    await page.locator('#err-button-confirm').first().click();
  });

  // Handler pre textové tlačidlo "Ano" (presná zhoda)
  await page.addLocatorHandler(page.getByRole('button', { name: 'Ano', exact: true }).first(), async () => {
    await page.getByRole('button', { name: 'Ano', exact: true }).first().click();
  });

  // Handler pre tlačidlo "OK" (presná zhoda)
  await page.addLocatorHandler(page.getByRole('button', { name: 'OK', exact: true }).first(), async () => {
    await page.getByRole('button', { name: 'OK', exact: true }).first().click();
  });
}

/**
 * Počká chvíľu na prípadné varovacie okno a ak má tlačidlo OK, tak ho odklikne.
 */
export async function clickOkIfPresent(page: Page, timeout = 5000) {
  try {
    const okButton = page.getByRole("button", { name: "OK" });
    await okButton.waitFor({ state: "visible", timeout });
    await okButton.click();
    console.log("ℹ️ Tlačidlo OK (napr. neprečítaná správa) bolo odkliknuté.");
  } catch (e) {
    // Tlačidlo tam nebolo, pokračujeme normálne.
  }
}

/**
 * Vyberie obec z autocomplete komponentu podľa názvu mesta.
 */
export async function selectObec(page: Page, containerId: string, mesto: string) {
  await page.locator(`//div[@id='${containerId}']//span[@role='combobox']`).click();
  const searchBox = page.locator(`//div[@id='${containerId}']//input[@role='searchbox']`);
  await searchBox.waitFor({ state: "visible" });
  await searchBox.fill(mesto);
  await page.waitForSelector(`//span[contains(text(),'${mesto.toUpperCase()}')]`);
  await page.locator(`//span[contains(text(),'${mesto.toUpperCase()}')]`).click();
}

/**
 * Doplní číslo nulami zľava.
 */
function pad(num: number, size: number): string {
  return num.toString().padStart(size, "0");
}

/**
 * Náhodné celé číslo v rozsahu vrátane min aj max.
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generuje náhodný textový string o zadané délce
 * @param length Délka stringu
 * @returns Náhodný string z písmen (A-Z, a-z)
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generuje test data pro narození (rodné číslo, jméno, příjmení)
 * @param birthYearFrom Počáteční rok narození
 * @param birthYearTo Koncový rok narození
 * @param sex Pohlaví ('M' nebo 'F')
 * @param nameLength Délka jména (default 5)
 * @param surnameLength Délka příjmení (default 5)
 * @returns Objekt s rodným číslem, jménem a příjmením
 */
export function generateNarozeniTestData(
  birthYearFrom: number,
  birthYearTo: number,
  sex: 'M' | 'F' = 'M',
  nameLength: number = 5,
  surnameLength: number = 5
) {
  const birthYear = birthYearFrom + Math.floor(Math.random() * (birthYearTo - birthYearFrom + 1));
  const config: RCConfig = { birthYear, sex };
  const rcResult = RCService.generateAndValidate(config);

  return {
    rodneCislo: rcResult.rc,
    jmeno: generateRandomString(nameLength),
    prijmeni: generateRandomString(surnameLength)
  };
}