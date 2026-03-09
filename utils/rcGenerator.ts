export function generateRC(sex: "M" | "F", birthYear = 1900): string {
  const year = birthYear;
  const month = getRandomInt(1, 12);

  // Správny počet dní v mesiaci s ohľadom na prestupné roky
  const daysInMonth = getDaysInMonth(year, month);
  const day = getRandomInt(1, daysInMonth);

  const twoDigitYear = year % 100;

  // Pravidlá pre generovanie mesiaca v rodnom čísle podľa skutočného systému
  let monthValue: number;

  // Systém používa rovnaké pravidlá pre všetky roky: MM + 50 pre ženy, MM pre mužov
  monthValue = sex === "F" ? month + 50 : month;

  const datePart = pad(twoDigitYear, 2) + pad(monthValue, 2) + pad(day, 2);

  // Začneme hľadať suffix od náhodného čísla (entropia)
  const startSuffix = getRandomInt(0, 9999);

  for (let i = 0; i < 10000; i++) {
    const suffixValue = (startSuffix + i) % 10000;
    const suffix = pad(suffixValue, 4);
    const rc = datePart + suffix;
    if (parseInt(rc, 10) % 11 === 0) {
      const fullRC = datePart + "/" + suffix;
      // Overenie, či je rodné číslo platné
      if (validateRC(fullRC)) {
        return fullRC;
      }
    }
  }

  throw new Error("Nepodarilo sa vygenerovať platné rodné číslo.");
}

export function validateRC(rc: string): boolean {
  // Odstránenie lomítka
  const cleanRC = rc.replace("/", "");

  if (cleanRC.length !== 10) {
    return false;
  }

  // Kontrola deliteľnosti 11
  return parseInt(cleanRC, 10) % 11 === 0;
}

export function decodeRC(rc: string): { year: number; month: number; day: number; sex: string } {
  const cleanRC = rc.replace("/", "");
  const yearPart = parseInt(cleanRC.substring(0, 2));
  const monthPart = parseInt(cleanRC.substring(2, 4));
  const dayPart = parseInt(cleanRC.substring(4, 6));

  let year: number;
  let month: number;
  let sex: string;

  // Určenie roku a pohlavia podľa mesiaca
  if (monthPart >= 1 && monthPart <= 12) {
    // Muž
    month = monthPart;
    sex = "M";
  } else if (monthPart >= 51 && monthPart <= 62) {
    // Žena
    month = monthPart - 50;
    sex = "F";
  } else {
    throw new Error("Neplatný formát rodného čísla");
  }

  // Určenie roku - pre roky 2000+ sa používa 20xx, pre staršie roky 19xx
  // Toto je zjednodušené pravidlo - v skutočnosti by sa malo riešiť podľa kontextu
  if (yearPart >= 0 && yearPart <= 30) {
    // Predpokladáme, že roky 00-30 sú 2000-2030
    year = 2000 + yearPart;
  } else {
    // Roky 31-99 sú 1931-1999
    year = 1900 + yearPart;
  }

  return { year, month, day: dayPart, sex };
}

function getDaysInMonth(year: number, month: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Prestný rok: rok je deliteľný 4, ale nie 100, alebo je deliteľný 400
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

  if (month === 2 && isLeapYear) {
    return 29;
  }

  return daysInMonth[month - 1];
}

function pad(num: number, size: number): string {
  return num.toString().padStart(size, "0");
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
} 