import { Page } from "@playwright/test";
import { RCService, RCConfig } from "../utils/rcService";
import { clickOkIfPresent } from "../utils/helpers";

export class EoPage {
  constructor(public page: Page) { }

  /**
   * Vykoná kompletný EO proces s generovaným rodným číslom
   */
  async executeCompleteEOProcess(config: RCConfig): Promise<string> {
    // Generovanie a validácia rodného čísla
    const rcResult = RCService.generateAndValidate(config);
    RCService.logRCInfo(rcResult.rc, rcResult.decoded, config.birthYear, config.sex);

    // Vykonanie EO procesu
    await this.performEOProcess(rcResult.rc, config.sex);

    return rcResult.rc;
  }

  /**
   * Vykoná EO proces s daným rodným číslom
   */
  async performEOProcess(rc: string, sex: "M" | "F"): Promise<void> {
    await this.login(rc);
    await this.fillPersonalData(sex);
    await this.fillAddress();
    await this.selectDruhPobytu();
    await this.fillBirthPlace();
    await this.selectRodinnyStav();
    await this.potvrdenia();
    await this.velkaRevize();
  }

  async login(rc: string) {
    await this.page.goto("http://vm-aisse:8081/jip-kaas/login?atsId=EO");
    await this.page.getByRole("button", { name: "EO - Jiří Gregor (MV ČR)" }).click();

    await this.page.locator("ais-rodne-cislo").getByRole("textbox").fill(rc);
    await this.page.getByRole("textbox", { name: "Důvod dotazu:" }).fill("duvod1");

    await this.page.getByRole("button", { name: " Vyhledat" }).click();
    await this.page.getByRole("button", { name: " Nová osoba" }).click();
  }

  async fillPersonalData(sex: "M" | "F") {
    const name = sex === "M" ? "Tomáš" : "Jana";
    const surname = sex === "M" ? "Test" : "Testová";

    await this.page.getByRole("textbox", { name: "Příjmení:", exact: true }).fill(surname);
    await this.page.getByRole("textbox", { name: "Jméno:" }).fill(name);
  }

  async fillAddress() {
    await this.selectObec("kodObec", "Benešov");
    await this.page.getByRole("textbox", { name: "Č. domovní:" }).fill("1");
    await this.page.getByRole("button", { name: " Vyhledat" }).click();
    await this.page.getByText("320110297").dblclick();
    await this.page.getByRole("textbox", { name: "Pobyt od:" }).fill("01.01.2020");
  }

  async selectDruhPobytu() {
    await this.page.locator("#osoba_typPobytu").click();

    // Retry mechanizmus pre výber z dropdownu (môže sa odpojiť kôli re-renderu)
    const optionSelector = "//li[@role='option' and normalize-space()='Platný TP']";
    try {
      await this.page.waitForSelector(optionSelector, { state: "visible", timeout: 5000 });
      const platnyTP = this.page.locator(optionSelector);
      await platnyTP.scrollIntoViewIfNeeded();
      await platnyTP.click();
    } catch (e) {
      // Ak prvý pokus zlyhal (napr. element detached), skúsime to znova
      await this.page.locator("#osoba_typPobytu").click(); // Znovu otvoríme ak sa zavrelo
      await this.page.locator(optionSelector).click({ timeout: 5000 });
    }
  }

  async fillBirthPlace() {
    await this.selectObec("osoba_obecKod", "Benešov");
  }

  async selectRodinnyStav() {
    await this.page.locator("#osoba_rodinnyStav").click();
    const stavOption = this.page.locator("text=Svobodný/Svobodná");
    try {
      await stavOption.waitFor({ state: "visible", timeout: 5000 });
      await stavOption.scrollIntoViewIfNeeded();
      await stavOption.click();
    } catch (e) {
      await this.page.locator("#osoba_rodinnyStav").click();
      await stavOption.click({ timeout: 5000 });
    }
  }

  async potvrdenia() {
    await this.page.getByRole("button", { name: "Potvrdit" }).click();
    await this.page.getByRole("button", { name: "Matka neuvedena" }).click();
    await this.page.getByRole("button", { name: "Otec neuveden" }).click();
    await this.page.getByRole("button", { name: "Potvrdit" }).click();
  }

  async selectObec(containerId: string, mesto: string) {
    await this.page.locator(`//div[@id='${containerId}']//span[@role='combobox']`).click();
    const searchBox = this.page.locator(`//div[@id='${containerId}']//input[@role='searchbox']`);
    await searchBox.waitFor({ state: "visible" });
    await searchBox.fill(mesto);
    await this.page.waitForSelector(`//span[contains(text(),'${mesto.toUpperCase()}')]`);
    // Použijeme first() aby sme vybrali prvý výsledok, keďže existuje viacero miest s rovnakým názvom
    await this.page.locator(`//span[contains(text(),'${mesto.toUpperCase()}')]`).first().click();
  }

  async clickIfAppears(selector: string, timeout = 1000) {
    try {
      // Skúsime počkať, či sa vôbec objaví prvýkrát
      await this.page.waitForSelector(selector, { state: "visible", timeout }).catch(() => { });

      let attempts = 0;
      // Klikáme rad radom na všetko čo vidíme s týmto selektorom, kým to nezmizne
      while (attempts < 5) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible().catch(() => false)) {
          await element.click({ timeout: 2000 }).catch(() => { });
          attempts++;
          // Krátka pauza na spracovanie requestu na FE
          await this.page.waitForTimeout(800);
        } else {
          break;
        }
      }
    } catch (e) {
      // ignorujeme
    }
  }

  async velkaRevize() {
    await this.page.locator('a').filter({ hasText: /^Revize$/ }).hover();
    await this.page.getByRole('link', { name: 'Velká revize' }).click();
    await this.page.getByRole('button', { name: 'Potvrdit' }).click();
  }
}