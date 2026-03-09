#!/bin/bash

# Načítanie NVM (ak je potrebné)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "🚀 Spúšťam všetkých 6 Playwright testov..."

# Spustenie testov
# --headed: uvidíš okná prehliadača
# --workers=1: testy pôjdu rad radom, aby sa "nepobili" na jednom testovacom účte
npx playwright test --headed --workers=1

echo "✅ Testy dobehli. Pre zobrazenie detailného reportu zadaj: npx playwright show-report"
