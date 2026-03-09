# Systém logov pre Playwright testy

## Prečo tento systém?

Tento systém rieši problém s blikaním logov na niektorých zariadeniach, ktoré používajú websocket riešenie. Namiesto toho sa logy ukladajú do SQLite databázy a načítavajú sa z nej ako **statické dáta bez blikania**.

## Ako to funguje?

1. **Database Logger**: `utils/databaseLogger.js` ukladá logy do SQLite databázy
2. **Test Logger**: `utils/testLogger.js` používa sa v testoch pre logovanie
3. **Log Viewer**: `utils/logViewer.js` zobrazuje logy v konzole
4. **Web Logger**: `utils/webLogger.js` poskytuje webové rozhranie

## Použitie

### Spustenie testov

```bash
npm test
```

### Zobrazenie logov

#### Konzolové zobrazenie

**Všetky logy (posledných 50):**

```bash
npm run logs
```

**Zlyhané testy (posledných 20):**

```bash
npm run logs:failed
```

**Úspešné testy (posledných 20):**

```bash
npm run logs:passed
```

**Všetky logy (posledných 100):**

```bash
npm run logs:all
```

#### Webové rozhranie (odporúčané)

**Spustenie web loggera:**

```bash
npm run web-logs
```

Potom otvorte prehliadač na: **http://localhost:3000**

**Výhody webového rozhrania:**

- ✅ **Žiadne blikanie** - statické zobrazenie
- ✅ **Moderné UI** - responzívny dizajn
- ✅ **Filtrovanie** - tlačidlá pre rôzne typy logov
- ✅ **Rýchle načítanie** - dáta sa načítavajú len pri požiadavke
- ✅ **Pohodlné zobrazenie** - tabuľkový formát s farbami

### Priame použitie logViewer

```bash
# Zobraziť posledných 30 logov
node utils/logViewer.js 30

# Zobraziť posledných 15 zlyhaných testov
node utils/logViewer.js failed 15

# Zobraziť posledných 25 úspešných testov
node utils/logViewer.js passed 25
```

## Štruktúra databázy

Databáza sa nachádza v `logs/test_logs.db` a obsahuje tabuľku `test_runs` s nasledujúcimi stĺpcami:

- `id` - unikátne ID testu
- `test_name` - názov testu
- `status` - stav testu (passed, failed, skipped, timedOut)
- `start_time` - čas začiatku testu
- `end_time` - čas konca testu
- `duration` - trvanie testu v sekundách
- `error_message` - chybová správa (ak test zlyhal)
- `screenshot_path` - cesta k screenshotu (ak existuje)

## Výhody

✅ **Žiadne blikanie** - logy sa načítavajú z databázy, nie cez websocket
✅ **Statické zobrazenie** - dáta sa neaktualizujú automaticky, len na požiadanie
✅ **Trvalé uloženie** - logy zostávajú uložené aj po reštarte
✅ **Rýchle načítanie** - SQLite je rýchla databáza
✅ **Filtrovanie** - možnosť zobraziť len zlyhané alebo úspešné testy
✅ **História** - všetky testy sú uložené s časovými značkami
✅ **Webové rozhranie** - moderné UI pre pohodlné zobrazenie

## Konfigurácia

Systém je automaticky nakonfigurovaný v `playwright.config.js`:

```javascript
reporter: [
  ["html"],
  ["json", { outputFile: "logs/test-results.json" }],
  ["list"],
];
```

## Príklad výstupu

### Konzolový výstup

```
📋 Všetky test logy:
================================================================================
✅ test s generovaným rodným číslom | passed | 45s | 2025-08-06 11:30:15
❌ login_failed_test | failed | 12s | 2025-08-06 11:25:30
   ❌ Chyba: locator.click: Error: strict mode violation
✅ visual_test_inventory | passed | 23s | 2025-08-06 11:20:45
```

### Webové rozhranie

- Moderné, responzívne UI
- Farebné označenie stavov testov
- Tabuľkový formát s možnosťou filtrovania
- Tlačidlo "Obnoviť" pre manuálne načítanie nových logov
