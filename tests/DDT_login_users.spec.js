import { test, expect } from "@playwright/test";
import { LoginPage } from "../POM/Login_page.js";
import { Inventory } from "../POM/Inventory_page.js";
import "dotenv/config";

test.describe("Login Success Tests", () => {
  test("test login, verify page, and logout for all users except locked_user", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new Inventory(page);

    const users = [
      process.env.STANDARD_USER,
      process.env.PROBLEM_USER,
      process.env.PERFORMANCE_GLITCH_USER,
      process.env.ERROR_USER,
      process.env.VISUAL_USER,
    ];

    for (const user of users) {
      console.log(`Testing login for: ${user}`);
      await loginPage.login(user, process.env.PASSWORD);
      await inventoryPage.verifyInventoryPage();
      await inventoryPage.logoutPage();
      await expect(page).toHaveURL("https://www.saucedemo.com/");
    }
    console.log("✅ All users login success");
  });
});
