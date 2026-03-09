import { Page } from '@playwright/test';
import { clickOkIfPresent } from '../utils/helpers';

export interface NalezenecTestData {
  rodneCislo: string;
  jmeno: string;
  prijmeni: string;
}

export class EoNalezenecPage {
  private testData: NalezenecTestData = {
    rodneCislo: '',
    jmeno: '',
    prijmeni: ''
  };

  constructor(private page: Page) { }

  /**
   * Získá test data (pro logování)
   */
  getTestData(): NalezenecTestData {
    return { ...this.testData };
  }

  /**
   * Naviguje na přihlašovací stránku
   */
  async navigate(): Promise<EoNalezenecPage> {
    await this.page.goto('http://vm-aisse:8081/jip-kaas/login?atsId=EO');
    return this;
  }

  /**
   * Přihlásí se do EO aplikace
   */
  async login(): Promise<EoNalezenecPage> {
    await this.page.getByRole('button', { name: 'EO - Jiří Gregor (MV ČR)' }).click();
    await clickOkIfPresent(this.page);
    return this;
  }

  /**
   * Vyhledá osobu podle rodného čísla
   */
  async searchByRodneCislo(rodneCislo: string, duvodDotazu: string = 'test1'): Promise<EoNalezenecPage> {
    this.testData.rodneCislo = rodneCislo;
    await this.page.locator('ais-rodne-cislo').getByRole('textbox').fill(rodneCislo);
    await this.page.getByRole('textbox', { name: 'Důvod dotazu:' }).click();
    await this.page.getByRole('textbox', { name: 'Důvod dotazu:' }).fill(duvodDotazu);
    await this.page.getByRole('button', { name: ' Vyhledat' }).click();
    return this;
  }

  /**
   * Otevře formulář pro narození
   */
  async openNarozeniForm(): Promise<EoNalezenecPage> {
    await this.page.getByRole('button', { name: ' Narození' }).click();
    // Tlačítko 'Ano' se může zobrazit, ale nemusí být vždy přítomno
    try {
      const anoButton = this.page.getByRole('button', { name: 'Ano' });
      await anoButton.waitFor({ state: 'visible', timeout: 5000 });
      await anoButton.click();
    } catch (e) {
      // Tlačítko 'Ano' není přítomno - formulář se otevřel přímo
    }
    return this;
  }

  /**
   * Vybere možnost "Nalezenec"
   */
  async selectNalezenec(): Promise<EoNalezenecPage> {
    await this.page.getByRole('radio', { name: 'Nalezenec' }).click();
    return this;
  }

  /**
   * Vyplní jméno a příjmení
   */
  async fillPersonalData(jmeno: string, prijmeni: string): Promise<EoNalezenecPage> {
    this.testData.jmeno = jmeno;
    this.testData.prijmeni = prijmeni;
    await this.page.getByRole('textbox', { name: 'Příjmení:' }).click();
    await this.page.getByRole('textbox', { name: 'Příjmení:' }).fill(prijmeni);
    await this.page.getByRole('textbox', { name: 'Příjmení:' }).press('Tab');
    await this.page.getByRole('textbox', { name: 'Jméno:' }).fill(jmeno);
    return this;
  }

  /**
   * Vybere obec
   */
  async selectObec(obecNazev: string): Promise<EoNalezenecPage> {
    await this.page.locator('#obecKod').getByRole('combobox').click();
    await this.page.getByRole('searchbox').fill(obecNazev.toLowerCase());
    await this.page.getByText(obecNazev.toUpperCase()).click();
    return this;
  }

  /**
   * Vybere městskou část
   */
  async selectMestskaCast(mestskaCastNazev: string): Promise<EoNalezenecPage> {
    await this.page.locator('#mestskaCastKod').getByRole('combobox').click();
    const mestskaCastSearchbox = this.page.locator('#mestskaCastKod').getByRole('searchbox');
    await mestskaCastSearchbox.waitFor({ state: 'visible' });
    await mestskaCastSearchbox.fill(mestskaCastNazev.toLowerCase());
    await this.page.getByText(mestskaCastNazev).waitFor({ state: 'visible' });
    await this.page.getByText(mestskaCastNazev).click();
    return this;
  }

  /**
   * Potvrdí formulář
   */
  async potvrdit(): Promise<EoNalezenecPage> {
    await this.page.getByRole('button', { name: 'Potvrdit' }).click();
    await clickOkIfPresent(this.page);
    return this;
  }

  /**
   * Kompletní workflow pro vytvoření nalezenec záznamu
   */
  async createNalezenec(config: {
    rodneCislo: string;
    jmeno: string;
    prijmeni: string;
    obecNazev: string;
    mestskaCastNazev: string;
    duvodDotazu?: string;
  }): Promise<EoNalezenecPage> {
    await this.navigate();
    await this.login();
    await this.searchByRodneCislo(config.rodneCislo, config.duvodDotazu);
    await this.openNarozeniForm();
    await this.selectNalezenec();
    await this.fillPersonalData(config.jmeno, config.prijmeni);
    await this.selectObec(config.obecNazev);
    await this.selectMestskaCast(config.mestskaCastNazev);
    await this.potvrdit();
    return this;
  }
}

