# EO Performance Tests - Príklady použitia

## 🚀 Základné spustenie

### Rýchly smoke test

```bash
cd performance-tests
npm run test:smoke
```

### Load test s verbóznym výstupom

```bash
npm run test:load:verbose
```

## 📊 Pokročilé príklady

### 1. Spustenie s custom parametrami

```bash
# 5 používateľov na 2 minúty
k6 run --vus=5 --duration=2m EO-performance.test.ts

# 10 používateľov na 5 minút s custom threshold
k6 run --vus=10 --duration=5m --threshold http_req_duration=p(95)<3000 EO-performance.test.ts
```

### 2. Spustenie s environment premennými

```bash
# Windows PowerShell
$env:BASE_URL="http://localhost:8081"
$env:EO_ENDPOINT="/custom-eo-endpoint"
npm run test:load

# Linux/Mac
export BASE_URL="http://localhost:8081"
export EO_ENDPOINT="/custom-eo-endpoint"
npm run test:load
```

### 3. Grafické výstupy

```bash
# JSON výstup pre analýzu
k6 run --out json=results.json EO-performance.test.ts

# InfluxDB výstup
k6 run --out influxdb=http://localhost:8086/k6 EO-performance.test.ts

# Grafana dashboard
k6 run --out grafana=http://localhost:3000/d/k6/k6-load-testing-results EO-performance.test.ts
```

### 4. Cloud testing s K6 Cloud

```bash
# Registrácia v K6 Cloud
k6 login cloud

# Spustenie v cloude
npm run test:load:cloud

# Spustenie s custom cloud konfiguráciou
k6 cloud --vus=50 --duration=10m EO-performance.test.ts
```

## 🔧 Konfiguračné príklady

### Custom threshold konfigurácia

```typescript
// V k6.config.js
export const options = {
  thresholds: {
    http_req_duration: ["p(95)<1500", "p(99)<3000"],
    http_req_failed: ["rate<0.05"],
    http_reqs: ["rate>2"],
    iteration_duration: ["p(95)<8000"],
  },
};
```

### Custom scenár

```typescript
// V scenarios/custom-test.ts
export const customTestOptions = {
  scenarios: {
    custom_scenario: {
      executor: "constant-arrival-rate",
      rate: 10, // 10 iterácií za sekundu
      timeUnit: "1s",
      duration: "5m",
      preAllocatedVUs: 20,
      maxVUs: 50,
    },
  },
};
```

## 📈 Analýza výsledkov

### 1. Základné metriky

```bash
# Spustenie s detailným výstupom
k6 run --summary-export=summary.json EO-performance.test.ts

# Analýza JSON súboru
cat summary.json | jq '.metrics'
```

### 2. Porovnanie testov

```bash
# Spustenie viacerých testov
k6 run --out json=smoke-results.json scenarios/smoke-test.ts
k6 run --out json=load-results.json scenarios/load-test.ts

# Porovnanie výsledkov
k6 run --compare smoke-results.json load-results.json
```

### 3. Trend analýza

```bash
# Spustenie testov v čase
for i in {1..5}; do
  echo "Test $i"
  k6 run --out json=test-$i.json EO-performance.test.ts
  sleep 60
done
```

## 🐛 Debug a troubleshooting

### 1. Debug režim

```bash
# Verbózny výstup
k6 run --verbose EO-performance.test.ts

# Debug s logovaním
k6 run --log-output=file=debug.log EO-performance.test.ts
```

### 2. Testovanie jednotlivých krokov

```bash
# Test len login kroku
k6 run --env TEST_STEP=login EO-performance.test.ts

# Test len s jedným používateľom
k6 run --vus=1 --duration=30s EO-performance.test.ts
```

### 3. Simulácia problémov

```bash
# Test s pomalým sieťovým pripojením
k6 run --throttle=100 EO-performance.test.ts

# Test s vysokým zaťažením
k6 run --vus=100 --duration=1m EO-performance.test.ts
```

## 🔄 CI/CD integrácia

### 1. GitHub Actions

```yaml
# .github/workflows/performance-tests.yml
name: Performance Tests
on: [push, pull_request]
jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install K6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      - name: Run Performance Tests
        run: |
          cd performance-tests
          npm run test:smoke
```

### 2. Jenkins Pipeline

```groovy
pipeline {
    agent any
    stages {
        stage('Performance Tests') {
            steps {
                sh 'cd performance-tests && npm run test:load'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'performance-tests',
                        reportFiles: 'performance-test-summary.json',
                        reportName: 'Performance Test Report'
                    ])
                }
            }
        }
    }
}
```

## 📊 Monitoring a alerting

### 1. Integrácia s monitoring systémom

```bash
# Prometheus metrics
k6 run --out prometheus=http://localhost:9090/metrics EO-performance.test.ts

# StatsD metrics
k6 run --out statsd=localhost:8125 EO-performance.test.ts
```

### 2. Custom metriky

```typescript
// V EO-performance.test.ts
import { Trend, Rate } from "k6/metrics";

const customTrend = new Trend("custom_metric");
const customRate = new Rate("custom_rate");

export default function () {
  // ... test kód ...

  customTrend.add(Date.now() - startTime);
  customRate.add(success ? 1 : 0);
}
```

## 🎯 Best practices

### 1. Testovanie postupnosť

1. **Smoke Test** - rýchla validácia
2. **Load Test** - normálne zaťaženie
3. **Stress Test** - vysoké zaťaženie
4. **Spike Test** - náhle zvýšenie

### 2. Threshold nastavenie

- Začnite s relaxovanými threshold
- Postupne ich zúžte podľa výsledkov
- Použite percentily (p95, p99) pre response time
- Nastavte error rate pod 1%

### 3. Testovacie dáta

- Použite realistické dáta
- Rotujte testovacie dáta
- Simulujte rôzne scenáre používateľov

### 4. Výsledky a reporting

- Ukladajte výsledky do verzií
- Porovnávajte výsledky v čase
- Automatizujte reporting
- Nastavte alerting pre kritické metriky
