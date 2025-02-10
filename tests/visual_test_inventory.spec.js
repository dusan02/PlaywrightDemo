import { test, expect } from "@playwright/test";
import fs from "fs";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { LoginPage } from "../POM/Login_page";
import "dotenv/config"; // Nahrádza require("dotenv").config()

const ensureDirExists = (path) => {
  const dir = path.substring(0, path.lastIndexOf("/"));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const compareImages = (baselinePath, currentPath, diffPath) => {
  const baselineImage = PNG.sync.read(fs.readFileSync(baselinePath));
  const currentImage = PNG.sync.read(fs.readFileSync(currentPath));
  const { width, height } = baselineImage;
  const diff = new PNG({ width, height });

  const mismatch = pixelmatch(
    baselineImage.data,
    currentImage.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  ensureDirExists(diffPath);
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  return mismatch;
};

test("Visual regression test for inventory page", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const screenshotPath = "screenshots/inventory_page.png";
  const baselinePath = "baseline/inventory_page.png";
  const diffPath = "diffs/inventory_page_diff.png";

  // Použitie prihlasovacích údajov z .env
  const username = process.env.STANDARD_USER;
  const password = process.env.PASSWORD;

  // Použitie POM na prihlásenie
  await loginPage.login(username, password);

  // Prejdeme na inventory
  await page.waitForURL("**/inventory.html");

  // Zoberieme screenshot aktuálnej stránky
  ensureDirExists(screenshotPath);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Skontrolujeme, či existuje baseline obrázok
  if (!fs.existsSync(baselinePath)) {
    console.log(
      "Baseline image does not exist. Saving current screenshot as baseline."
    );
    ensureDirExists(baselinePath);
    fs.copyFileSync(screenshotPath, baselinePath);
    return;
  }

  // Porovnanie obrázkov
  const mismatch = compareImages(baselinePath, screenshotPath, diffPath);

  // Overenie výsledku
  expect(mismatch).toBe(
    0,
    `Visual regression detected. See diff at: ${diffPath}`
  );

  console.log("✅ Visual test - Inventory page");
});
