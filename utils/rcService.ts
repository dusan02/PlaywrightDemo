import { generateRC, decodeRC } from "./rcGenerator";

export interface RCConfig {
  birthYear: number;
  sex: "M" | "F";
}

export interface RCResult {
  rc: string;
  decoded: {
    year: number;
    month: number;
    day: number;
    sex: string;
  };
}

export class RCService {
  private static usedRCs = new Set<string>();

  /**
   * Vygeneruje a overí rodné číslo podľa zadaných parametrov, zabezpečí unikátnosť v rámci behu
   */
  static generateAndValidate(config: RCConfig): RCResult {
    const { birthYear, sex } = config;
    let rc: string = "";
    let decoded: any;

    // Pokúšame sa vygenerovať unikátne RČ
    let attempts = 0;
    while (attempts < 50) {
      rc = generateRC(sex, birthYear);
      if (!this.usedRCs.has(rc)) {
        this.usedRCs.add(rc);
        break;
      }
      attempts++;
    }

    if (attempts === 50) {
      throw new Error(`Nepodarilo sa vygenerovať unikátne rodné číslo pre rok ${birthYear} po 50 pokusoch.`);
    }

    // Dekódovanie pre overenie
    decoded = decodeRC(rc);

    // Validácia roku narodenia
    if (decoded.year !== birthYear) {
      throw new Error(`Dátum narodenia ${decoded.year} nezhoduje sa so zadaným rokom ${birthYear}`);
    }

    // Validácia pohlavia
    if (decoded.sex !== sex) {
      throw new Error(`Pohlavie ${decoded.sex} nezhoduje sa so zadaným ${sex}`);
    }

    return { rc, decoded };
  }

  /**
   * Vypíše informácie o vygenerovanom rodnom čísle
   */
  static logRCInfo(rc: string, decoded: RCResult['decoded'], birthYear: number, sex: "M" | "F", jmeno?: string, prijmeni?: string): void {
    const name = jmeno || (sex === "M" ? "Tomáš" : "Jana");
    const surname = prijmeni || (sex === "M" ? "Test" : "Testová");

    console.log("➡️ EO s rč:", rc);
    console.log(`👤 Osoba: ${name} ${surname}`);
    console.log(`📅 Generované pre osobu narodenú v roku ${birthYear}`);
    console.log(`🔍 Dekódované: ${decoded.day}.${decoded.month}.${decoded.year}, pohlavie: ${decoded.sex}`);
  }
}
