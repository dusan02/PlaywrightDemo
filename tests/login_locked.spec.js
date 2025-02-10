import { test, expect } from "@playwright/test";
import { LoginPage } from "../POM/Login_page.js";

test("test login for locked user", async ({ page }) => {
  const loginPage = new LoginPage(page);

  const expectedMessage = "Epic sadface: Sorry, this user has been locked out.";
  await loginPage.login(process.env.LOCKED_USER, process.env.PASSWORD);
  await loginPage.verifyErrorMessage(expectedMessage);
  await loginPage.closeErrorMessage();
  await expect(page).toHaveURL("https://www.saucedemo.com/");

  console.log("✅ Login locked");
});
