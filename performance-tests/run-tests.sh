#!/bin/bash

# EO Performance Tests Runner
# Tento skript spúšťa rôzne performance testy pre EO proces

echo "🚀 EO Performance Tests Runner"
echo "================================"

# Kontrola, či je K6 nainštalovaný
if ! command -v k6 &> /dev/null; then
    echo "❌ K6 nie je nainštalovaný. Nainštalujte K6 pred pokračovaním."
    echo "   Inštalácia: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Kontrola, či existuje testovacie prostredie
BASE_URL=${BASE_URL:-"http://vm-aisse:8081"}
echo "🔍 Kontrola dostupnosti testovacieho prostredia: $BASE_URL"

if ! curl -s --head "$BASE_URL" | head -n 1 | grep -q "200 OK"; then
    echo "⚠️  Testovacie prostredie nie je dostupné na $BASE_URL"
    echo "   Testy môžu zlyhať. Pokračujem..."
fi

echo ""
echo "📋 Dostupné testy:"
echo "1. Smoke Test (rýchly test)"
echo "2. Load Test (normálne zaťaženie)"
echo "3. Stress Test (vysoké zaťaženie)"
echo "4. Spike Test (náhle zvýšenie zaťaženia)"
echo "5. Všetky testy"
echo "6. Custom test s parametrami"
echo ""

read -p "Vyberte test (1-6): " choice

case $choice in
    1)
        echo "🔥 Spúšťam Smoke Test..."
        k6 run --config=../k6.config.js scenarios/smoke-test.ts
        ;;
    2)
        echo "⚡ Spúšťam Load Test..."
        k6 run --config=../k6.config.js scenarios/load-test.ts
        ;;
    3)
        echo "💪 Spúšťam Stress Test..."
        k6 run --config=../k6.config.js scenarios/stress-test.ts
        ;;
    4)
        echo "📈 Spúšťam Spike Test..."
        k6 run --config=../k6.config.js scenarios/spike-test.ts
        ;;
    5)
        echo "🎯 Spúšťam všetky testy..."
        echo "1/4 - Smoke Test"
        k6 run --config=../k6.config.js scenarios/smoke-test.ts
        echo "2/4 - Load Test"
        k6 run --config=../k6.config.js scenarios/load-test.ts
        echo "3/4 - Stress Test"
        k6 run --config=../k6.config.js scenarios/stress-test.ts
        echo "4/4 - Spike Test"
        k6 run --config=../k6.config.js scenarios/spike-test.ts
        ;;
    6)
        echo "🔧 Custom test s parametrami"
        read -p "Počet používateľov (VUs): " vus
        read -p "Trvanie (napr. 30s, 2m): " duration
        read -p "Test typ (smoke/load/stress/spike): " test_type
        
        echo "Spúšťam custom test: $vus VUs, $duration, $test_type"
        k6 run --config=../k6.config.js --vus=$vus --duration=$duration EO-performance.test.ts
        ;;
    *)
        echo "❌ Neplatná voľba"
        exit 1
        ;;
esac

echo ""
echo "✅ Test dokončený!"
echo "📊 Výsledky sú uložené v performance-test-summary.json"
echo "📈 Pre grafické znázornenie použite: k6 run --out json=results.json EO-performance.test.ts"
