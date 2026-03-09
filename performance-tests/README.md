# EO Performance Tests with K6

Tento projekt obsahuje performance testy pre EO (Evidence Osob) proces pomocou K6 load testing nástroja s TypeScript podporou.

## 📋 Požiadavky

- [K6](https://k6.io/docs/getting-started/installation/) nainštalovaný
- Node.js (pre TypeScript kompiláciu)
- Prístup k testovaciemu prostrediu `http://vm-aisse:8081`

## 🚀 Rýchly štart

### 1. Inštalácia závislostí

```bash
cd performance-tests
npm install
```

### 2. Spustenie testov

#### Smoke Test (rýchly test)

```bash
npm run test:smoke
```

#### Load Test (normálne zaťaženie)

```bash
npm run test:load
```

#### Stress Test (vysoké zaťaženie)

```bash
npm run test:stress
```

#### Spike Test (náhle zvýšenie zaťaženia)

```bash
npm run test:spike
```

#### Všetky testy

```bash
npm run test:all
```

### 3. Verbózny výstup

```bash
npm run test:smoke:verbose
```

### 4. Cloud testing (K6 Cloud)

```bash
npm run test:smoke:cloud
```

## 📊 Testovacie scenáre

### Smoke Test

- **Cieľ**: Rýchla validácia, že systém funguje
- **Používatelia**: 1
- **Trvanie**: 30 sekúnd
- **Thresholds**: Relaxované pre rýchlu validáciu

### Load Test

- **Cieľ**: Testovanie normálneho očakávaného zaťaženia
- **Používatelia**: 1 → 10 → 0 (ramping)
- **Trvanie**: 9 minút
- **Thresholds**: Štandardné požiadavky

### Stress Test

- **Cieľ**: Testovanie vysokého zaťaženia
- **Používatelia**: 1 → 20 → 0 (ramping)
- **Trvanie**: 9 minút
- **Thresholds**: Relaxované pre vysoké zaťaženie

### Spike Test

- **Cieľ**: Testovanie náhleho zvýšenia zaťaženia
- **Používatelia**: 5 → 50 → 5 → 0 (spike pattern)
- **Trvanie**: 3.5 minúty
- **Thresholds**: Veľmi relaxované pre spike testovanie

## 🎯 Metriky a Thresholds

### Základné metriky

- `http_req_duration`: Doba trvania HTTP požiadaviek
- `http_req_failed`: Miera chybných požiadaviek
- `http_reqs`: Počet HTTP požiadaviek za sekundu
- `iteration_duration`: Doba trvania jednej iterácie

### Custom metriky

- `errors`: Miera chýb v testoch
- `eo_process_duration`: Doba trvania celého EO procesu

### Thresholds

- **Response Time**: 95% požiadaviek pod 2s (load test)
- **Error Rate**: Menej ako 10% chybných požiadaviek
- **Throughput**: Viac ako 1 požiadavka za sekundu
- **EO Process**: 95% EO procesov pod 10s

## 🔧 Konfigurácia

### Environment variables

```bash
export BASE_URL="http://vm-aisse:8081"
export EO_ENDPOINT="/jip-kaas/login?atsId=EO"
```

### Testovacie dáta

Testovacie dáta sú konfigurované v `EO-performance.test.ts`:

- Rok narodenia: 1972
- Pohlavie: M (muž)
- Osobné údaje: Tomáš Test
- Adresa: Benešov

## 📈 Výsledky

### Konzolový výstup

K6 poskytuje detailný výstup v konzole s:

- Real-time metriky
- Threshold výsledky
- Grafické znázornenie

### JSON súhrn

Po každom teste sa vytvorí `performance-test-summary.json` s:

- Celkovými metrikami
- Threshold výsledkami
- Časovou značkou

### Grafické výstupy

Pre grafické znázornenie použite:

```bash
k6 run --out json=results.json EO-performance.test.ts
```

## 🛠️ Prispôsobenie

### Zmena testovacích scenárov

Upravte súbory v `scenarios/` priečinku:

- `smoke-test.ts`
- `load-test.ts`
- `stress-test.ts`
- `spike-test.ts`

### Zmena thresholdov

Upravte `thresholds` v konfiguračných súboroch alebo `k6.config.js`.

### Pridanie nových metrík

Pridajte custom metriky v `EO-performance.test.ts`:

```typescript
const customMetric = new Trend("custom_metric");
```

## 🐛 Troubleshooting

### Časté problémy

1. **Connection refused**: Skontrolujte, či je testovacie prostredie dostupné
2. **TypeScript chyby**: Uistite sa, že máte nainštalované `@types/k6`
3. **Threshold failures**: Upravte threshold hodnoty podľa potreby

### Debug režim

```bash
k6 run --config=../k6.config.js --verbose scenarios/smoke-test.ts
```

## 📚 Ďalšie zdroje

- [K6 Documentation](https://k6.io/docs/)
- [K6 TypeScript Support](https://k6.io/docs/using-k6/typescript/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/)

## 🤝 Príspevky

Pre príspevky do projektu:

1. Vytvorte feature branch
2. Implementujte zmeny
3. Otestujte zmeny
4. Vytvorte pull request

## 📄 Licencia

MIT License - pozrite si LICENSE súbor pre detaily.
