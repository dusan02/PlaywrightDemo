import { test, expect } from "@playwright/test";
import { LoginPage } from "../POM/Login_page.js";

test("test login failed", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.login(process.env.STANDARD_USER, process.env.WRONG_PASSWORD);

  await expect(page).toHaveURL("https://www.saucedemo.com/");

  const errorMessage = await page.textContent(".error-message-container");
  expect(errorMessage).toContain(
    "Epic sadface: Username and password do not match any user in this service"
  );

  console.log("✅ Login failed");
});
