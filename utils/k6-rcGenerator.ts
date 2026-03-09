/**
 * K6 compatible RC (Birth Certificate Number) Generator
 * Adapted from the original rcGenerator.ts for K6 environment
 */

export interface RCResult {
  rc: string;
  decoded: {
    year: number;
    month: number;
    day: number;
    sex: string;
  };
}

export class RCGenerator {
  /**
   * Generate birth certificate number
   */
  static generateRC(sex: "M" | "F", birthYear: number): string {
    const year = birthYear;
    const month = this.getRandomInt(1, 12);
    
    // Correct number of days in month considering leap years
    const daysInMonth = this.getDaysInMonth(year, month);
    const day = this.getRandomInt(1, daysInMonth);

    const twoDigitYear = year % 100;
    
    // Rules for generating month in birth certificate number
    let monthValue: number;
    
    // System uses same rules for all years: MM + 50 for women, MM for men
    monthValue = sex === "F" ? month + 50 : month;

    const datePart = this.pad(twoDigitYear, 2) + this.pad(monthValue, 2) + this.pad(day, 2);

    for (let i = 0; i < 10000; i++) {
      const suffix = this.pad(i, 4);
      const rc = datePart + suffix;
      if (parseInt(rc, 10) % 11 === 0) {
        const fullRC = datePart + "/" + suffix;
        // Verify that the birth certificate number is valid
        if (this.validateRC(fullRC)) {
          return fullRC;
        }
      }
    }

    throw new Error("Failed to generate valid birth certificate number.");
  }

  /**
   * Validate birth certificate number
   */
  static validateRC(rc: string): boolean {
    // Remove slash
    const cleanRC = rc.replace("/", "");
    
    if (cleanRC.length !== 10) {
      return false;
    }
    
    // Check divisibility by 11
    return parseInt(cleanRC, 10) % 11 === 0;
  }

  /**
   * Decode birth certificate number
   */
  static decodeRC(rc: string): RCResult['decoded'] {
    const cleanRC = rc.replace("/", "");
    const yearPart = parseInt(cleanRC.substring(0, 2));
    const monthPart = parseInt(cleanRC.substring(2, 4));
    const dayPart = parseInt(cleanRC.substring(4, 6));
    
    let year: number;
    let month: number;
    let sex: string;
    
    // Determine year and sex based on month - simplified rules
    if (monthPart >= 1 && monthPart <= 12) {
      // Male
      year = 1900 + yearPart;
      month = monthPart;
      sex = "M";
    } else if (monthPart >= 51 && monthPart <= 62) {
      // Female
      year = 1900 + yearPart;
      month = monthPart - 50;
      sex = "F";
    } else {
      throw new Error("Invalid birth certificate number format");
    }
    
    return { year, month, day: dayPart, sex };
  }

  /**
   * Generate and validate birth certificate number
   */
  static generateAndValidate(sex: "M" | "F", birthYear: number): RCResult {
    const rc = this.generateRC(sex, birthYear);
    const decoded = this.decodeRC(rc);
    
    // Validate birth year
    if (decoded.year !== birthYear) {
      throw new Error(`Birth year ${decoded.year} does not match specified year ${birthYear}`);
    }
    
    // Validate sex
    if (decoded.sex !== sex) {
      throw new Error(`Sex ${decoded.sex} does not match specified ${sex}`);
    }
    
    return { rc, decoded };
  }

  /**
   * Get number of days in month
   */
  private static getDaysInMonth(year: number, month: number): number {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Leap year: year is divisible by 4, but not 100, or is divisible by 400
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    
    if (month === 2 && isLeapYear) {
      return 29;
    }
    
    return daysInMonth[month - 1];
  }

  /**
   * Pad number with leading zeros
   */
  private static pad(num: number, size: number): string {
    return num.toString().padStart(size, "0");
  }

  /**
   * Get random integer between min and max (inclusive)
   */
  private static getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
