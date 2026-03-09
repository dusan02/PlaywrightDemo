import { Page } from '@playwright/test';
import { clickOkIfPresent } from '../utils/helpers';

export interface NarozeniTestData {
  rodneCislo: string;
  jmeno: string;
  prijmeni: string;
}

export class EoNarozeniPage {
  private testData: NarozeniTestData = {
    rodneCislo: '',
    jmeno: '',
    prijmeni: ''
  };

  constructor(private page: Page) { }

  /**
   * Získá test data (pro logování)
   */
  getTestData(): NarozeniTestData {
    return { ...this.testData };
  }

  /**
   * Naviguje na hlavní stránku
   */
  async navigate(): Promise<EoNarozeniPage> {
    await this.page.goto('http://vm-aisse.komix.com/');
    return this;
  }

  /**
   * Otevře EO aplikaci
   */
  async openEOApp(): Promise<EoNarozeniPage> {
    await this.page.getByTitle('http://vm-aisse:8081/ais-eo-').click();
    await this.page.getByRole('button', { name: 'EO - Jiří Gregor (MV ČR)' }).click();
    await clickOkIfPresent(this.page);
    return this;
  }

  /**
   * Vyhledá osobu podle rodného čísla
   */
  async searchByRodneCislo(rodneCislo: string, duvodDotazu: string = 'test'): Promise<EoNarozeniPage> {
    this.testData.rodneCislo = rodneCislo;
    await this.page.locator('ais-rodne-cislo').getByRole('textbox').fill(rodneCislo);
    await this.page.getByRole('textbox', { name: 'Důvod dotazu:' }).click({
      modifiers: ['ControlOrMeta']
    });
    await this.page.getByRole('textbox', { name: 'Důvod dotazu:' }).fill(duvodDotazu);
    await this.page.getByRole('button', { name: ' Vyhledat' }).click();
    return this;
  }

  /**
   * Otevře formulář pro narození
   */
  async openNarozeniForm(): Promise<EoNarozeniPage> {
    await this.page.getByRole('button', { name: ' Narození' }).click();
    // Tlačítko 'Ano' se může zobrazit, ale nemusí být vždy přítomno - pokusíme se na něj kliknout, pokud existuje
    try {
      const anoButton = this.page.getByRole('button', { name: 'Ano' });
      await anoButton.waitFor({ state: 'visible', timeout: 2000 });
      await anoButton.click();
    } catch (e) {
      // Tlačítko 'Ano' není přítomno - formulář se otevřel přímo, což je v pořádku
    }
    return this;
  }

  /**
   * Klikne na pole rodného čísla dítěte, aby se dopočítal datum narození
   * (Rodné číslo je už vyplněné z předchozího kroku)
   */
  async clickRodneCisloDite(): Promise<EoNarozeniPage> {
    const rodneCisloField = this.page.getByRole('region', { name: 'Novorozenec' }).locator('form').getByRole('textbox').first();
    // Kliknutí na pole, aby se dopočítal datum narození
    await rodneCisloField.click();
    return this;
  }

  /**
   * Vyplní jméno a příjmení narozeného dítěte
   */
  async fillDiteData(jmeno: string, prijmeni: string): Promise<EoNarozeniPage> {
    this.testData.jmeno = jmeno;
    this.testData.prijmeni = prijmeni;
    await this.page.getByRole('textbox', { name: 'Příjmení:' }).fill(prijmeni);
    await this.page.getByRole('textbox', { name: 'Jméno:' }).fill(jmeno);
    return this;
  }

  /**
   * Otevře vyhledávání matky
   */
  async openMatkaSearch(): Promise<EoNarozeniPage> {
    await this.page.getByLabel('Matka').getByRole('button', { name: ' Vyhledat' }).click();
    return this;
  }

  /**
   * Vyhledá matku podle data narození a příjmení
   */
  async searchMatka(datumNarozeni: string, prijmeni: string): Promise<EoNarozeniPage> {
    await this.page.getByRole('radio', { name: 'Datum narození' }).click();
    await this.page.getByLabel('', { exact: true }).getByRole('textbox', { name: 'Datum narození:' }).fill(datumNarozeni);
    await this.page.getByLabel('', { exact: true }).getByRole('textbox', { name: 'Příjmení:', exact: true }).fill(prijmeni);
    await this.page.getByLabel('', { exact: true }).getByRole('button', { name: ' Vyhledat' }).click();
    return this;
  }

  /**
   * Vybere matku z výsledků vyhledávání
   */
  async selectMatka(cellContent: string): Promise<EoNarozeniPage> {
    await this.page.getByRole('cell', { name: cellContent }).dblclick();
    return this;
  }

  /**
   * Vybere obec pro místo narození
   */
  async selectObecNarozeni(obecNazev: string): Promise<EoNarozeniPage> {
    await this.page.locator('#obecKod').scrollIntoViewIfNeeded();
    await this.page.locator('#obecKod').getByRole('combobox').click();
    await this.page.getByRole('searchbox').fill(obecNazev.toLowerCase());
    await this.page.getByText(obecNazev.toUpperCase()).click();
    return this;
  }

  /**
   * Potvrdí formulář
   */
  async potvrdit(): Promise<EoNarozeniPage> {
    // První kliknutí na Potvrdit
    await this.page.getByRole('button', { name: 'Potvrdit' }).click();

    // Kliknutí na všechna tlačítka 'Ano' postupně (pro chyby s jménem a příjmením)
    // Počkáme, až se objeví první tlačítko 'Ano', pokud existuje
    let anoButtonsVisible = true;
    let clickedCount = 0;
    const maxClicks = 10; // Maximální počet kliknutí pro bezpečnost

    while (anoButtonsVisible && clickedCount < maxClicks) {
      try {
        // Počkáme na zobrazení tlačítka 'Ano' s delším timeoutem
        const anoButton = this.page.getByRole('button', { name: 'Ano' }).first();
        await anoButton.waitFor({ state: 'visible', timeout: 3000 });

        // Klikneme na první dostupné tlačítko 'Ano'
        await anoButton.click();
        clickedCount++;

        // Zkontrolujeme, jestli existuje další viditelné tlačítko 'Ano'
        // Zkontrolujeme počet všech tlačítek 'Ano' (včetně skrytých)
        const allAnoButtons = this.page.getByRole('button', { name: 'Ano' });
        const totalCount = await allAnoButtons.count();

        // Pokud není žádné tlačítko, ukončíme cyklus
        if (totalCount === 0) {
          anoButtonsVisible = false;
        } else {
          // Zkontrolujeme, jestli je alespoň jedno viditelné
          let hasVisible = false;
          for (let i = 0; i < totalCount; i++) {
            const isVisible = await allAnoButtons.nth(i).isVisible().catch(() => false);
            if (isVisible) {
              hasVisible = true;
              break;
            }
          }
          anoButtonsVisible = hasVisible;
        }
      } catch (e) {
        // Pokud už není žádné tlačítko 'Ano' nebo timeout, ukončíme cyklus
        anoButtonsVisible = false;
      }
    }

    // Po zpracování všech chyb znovu klikneme na Potvrdit
    await this.page.getByRole('button', { name: 'Potvrdit' }).click();

    // Po druhém kliknutí na Potvrdit může znovu vzniknout tlačítko 'Ano', musíme ho také zpracovat
    anoButtonsVisible = true;
    clickedCount = 0;

    while (anoButtonsVisible && clickedCount < maxClicks) {
      try {
        // Počkáme na zobrazení tlačítka 'Ano' s delším timeoutem
        const anoButton = this.page.getByRole('button', { name: 'Ano' }).first();
        await anoButton.waitFor({ state: 'visible', timeout: 3000 });

        // Klikneme na první dostupné tlačítko 'Ano'
        await anoButton.click();
        clickedCount++;

        // Zkontrolujeme, jestli existuje další viditelné tlačítko 'Ano'
        const allAnoButtons = this.page.getByRole('button', { name: 'Ano' });
        const totalCount = await allAnoButtons.count();

        // Pokud není žádné tlačítko, ukončíme cyklus
        if (totalCount === 0) {
          anoButtonsVisible = false;
        } else {
          // Zkontrolujeme, jestli je alespoň jedno viditelné
          let hasVisible = false;
          for (let i = 0; i < totalCount; i++) {
            const isVisible = await allAnoButtons.nth(i).isVisible().catch(() => false);
            if (isVisible) {
              hasVisible = true;
              break;
            }
          }
          anoButtonsVisible = hasVisible;
        }
      } catch (e) {
        // Pokud už není žádné tlačítko 'Ano' nebo timeout, ukončíme cyklus
        anoButtonsVisible = false;
      }
    }

    // Kliknutí na tlačítko Potvrdit (až po zpracování všech tlačítek 'Ano')
    await this.page.getByRole('button', { name: 'Potvrdit' }).click();

    return this;
  }

  /**
   * Kompletní workflow pro vytvoření narození
   */
  async createNarozeni(config: {
    rodneCislo: string;
    jmeno: string;
    prijmeni: string;
    matkaDatumNarozeni: string;
    matkaPrijmeni: string;
    matkaCellContent: string;
    obecNazev: string;
    duvodDotazu?: string;
  }): Promise<EoNarozeniPage> {
    await this.searchByRodneCislo(config.rodneCislo, config.duvodDotazu || 'test');
    await this.openNarozeniForm();
    await this.clickRodneCisloDite();
    await this.fillDiteData(config.jmeno, config.prijmeni);
    await this.openMatkaSearch();
    await this.searchMatka(config.matkaDatumNarozeni, config.matkaPrijmeni);
    await this.selectMatka(config.matkaCellContent);
    await this.selectObecNarozeni(config.obecNazev);
    await this.potvrdit();
    return this;
  }
}

