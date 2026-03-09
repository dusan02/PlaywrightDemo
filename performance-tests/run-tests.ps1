# EO Performance Tests Runner (PowerShell)
# Tento skript spúšťa rôzne performance testy pre EO proces

Write-Host "🚀 EO Performance Tests Runner" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Kontrola, či je K6 nainštalovaný
try {
    k6 version 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "K6 not found"
    }
    Write-Host "✅ K6 je nainštalovaný" -ForegroundColor Green
}
catch {
    Write-Host "❌ K6 nie je nainštalovaný. Nainštalujte K6 pred pokračovaním." -ForegroundColor Red
    Write-Host "   Inštalácia: https://k6.io/docs/getting-started/installation/" -ForegroundColor Yellow
    exit 1
}

# Kontrola, či existuje testovacie prostredie
$BASE_URL = if ($env:BASE_URL) { $env:BASE_URL } else { "http://vm-aisse:8081" }
Write-Host "🔍 Kontrola dostupnosti testovacieho prostredia: $BASE_URL" -ForegroundColor Cyan

try {
    Invoke-WebRequest -Uri $BASE_URL -Method Head -TimeoutSec 5 -ErrorAction Stop | Out-Null
    Write-Host "✅ Testovacie prostredie je dostupné" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Testovacie prostredie nie je dostupné na $BASE_URL" -ForegroundColor Yellow
    Write-Host "   Testy môžu zlyhať. Pokračujem..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Dostupné testy:" -ForegroundColor Cyan
Write-Host "1. Smoke Test (rýchly test)" -ForegroundColor White
Write-Host "2. Load Test (normálne zaťaženie)" -ForegroundColor White
Write-Host "3. Stress Test (vysoké zaťaženie)" -ForegroundColor White
Write-Host "4. Spike Test (náhle zvýšenie zaťaženia)" -ForegroundColor White
Write-Host "5. Všetky testy" -ForegroundColor White
Write-Host "6. Custom test s parametrami" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Vyberte test (1-6)"

switch ($choice) {
    "1" {
        Write-Host "🔥 Spúšťam Smoke Test..." -ForegroundColor Yellow
        k6 run --config=../k6.config.js scenarios/smoke-test.ts
    }
    "2" {
        Write-Host "⚡ Spúšťam Load Test..." -ForegroundColor Yellow
        k6 run --config=../k6.config.js scenarios/load-test.ts
    }
    "3" {
        Write-Host "💪 Spúšťam Stress Test..." -ForegroundColor Yellow
        k6 run --config=../k6.config.js scenarios/stress-test.ts
    }
    "4" {
        Write-Host "📈 Spúšťam Spike Test..." -ForegroundColor Yellow
        k6 run --config=../k6.config.js scenarios/spike-test.ts
    }
    "5" {
        Write-Host "🎯 Spúšťam všetky testy..." -ForegroundColor Yellow
        Write-Host "1/4 - Smoke Test" -ForegroundColor Cyan
        k6 run --config=../k6.config.js scenarios/smoke-test.ts
        Write-Host "2/4 - Load Test" -ForegroundColor Cyan
        k6 run --config=../k6.config.js scenarios/load-test.ts
        Write-Host "3/4 - Stress Test" -ForegroundColor Cyan
        k6 run --config=../k6.config.js scenarios/stress-test.ts
        Write-Host "4/4 - Spike Test" -ForegroundColor Cyan
        k6 run --config=../k6.config.js scenarios/spike-test.ts
    }
    "6" {
        Write-Host "🔧 Custom test s parametrami" -ForegroundColor Yellow
        $vus = Read-Host "Počet používateľov (VUs)"
        $duration = Read-Host "Trvanie (napr. 30s, 2m)"
        $testType = Read-Host "Test typ (smoke/load/stress/spike)"
        
        Write-Host "Spúšťam custom test: $vus VUs, $duration, $testType" -ForegroundColor Cyan
        k6 run --config=../k6.config.js --vus=$vus --duration=$duration EO-performance.test.ts
    }
    default {
        Write-Host "❌ Neplatná voľba" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Test dokončený!" -ForegroundColor Green
Write-Host "📊 Výsledky sú uložené v performance-test-summary.json" -ForegroundColor Cyan
Write-Host "📈 Pre grafické znázornenie použite: k6 run --out json=results.json EO-performance.test.ts" -ForegroundColor Cyan
