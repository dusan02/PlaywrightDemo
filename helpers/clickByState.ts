import { Page } from '@playwright/test';

/**
 * Klikne podľa viditeľnosti tlačidiel:
 *  1. "Ano"   → klik
 *  2. "Potvrdit" (enabled) → klik
 *  3. "OK"    → klik
 * Ak nič z toho nevidí, len zaloguje.
 */
export async function clickByState(page: Page): Promise<void> {
  const btnAno = page.getByRole('button', { name: 'Ano' });
  const btnPotvrdit = page.getByRole('button', { name: 'Potvrdit' });
  const btnOK = page.getByRole('button', { name: 'OK', exact: true });

  if (await btnAno.isVisible())            return btnAno.click();
  if (await btnPotvrdit.isVisible() && await btnPotvrdit.isEnabled())
                                           return btnPotvrdit.click();
  if (await btnOK.isVisible())             return btnOK.click();

  console.warn('🔍 Žiadne akčné tlačidlo nie je viditeľné.');
}
