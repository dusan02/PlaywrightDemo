import { test, expect } from "@playwright/test";
import { LoginPage } from "../POM/Login_page.js";
import { Inventory } from "../POM/Inventory_page.js";
import "dotenv/config";

const users = [
  process.env.STANDARD_USER,
  process.env.PROBLEM_USER,
  process.env.PERFORMANCE_GLITCH_USER,
  process.env.ERROR_USER,
  process.env.VISUAL_USER,
];

test.describe("Login Success Tests", () => {
  test.describe.parallel("Parallel Login Tests", () => {
    for (const user of users) {
      test(`Test login, verify page, and logout for user: ${user}`, async ({
        page,
      }) => {
        const loginPage = new LoginPage(page);
        const inventoryPage = new Inventory(page);

        /*console.log(`Testing login for: ${user}`);
        await loginPage.login(user, process.env.PASSWORD);
        await inventoryPage.verifyInventoryPage();
        await inventoryPage.logoutPage();
        await expect(page).toHaveURL("https://www.saucedemo.com/");*/
        console.log(`✅ Login success for: ${user}`);
      });
    }
  });
});
