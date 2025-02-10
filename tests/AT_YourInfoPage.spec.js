import "dotenv/config";
import { test, expect } from "@playwright/test";
import { LoginPage } from "../POM/Login_page";
import { Inventory } from "../POM/Inventory_page";
import { Cart } from "../POM/Cart_page";
import { YourInfo } from "../POM/YourInfo_page";

test("Atomic test - YourInfoPage", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new Inventory(page);
  const cartPage = new Cart(page);
  const yourInfoPage = new YourInfo(page);

  // Step 1: Login
  await loginPage.login(process.env.STANDARD_USER, process.env.PASSWORD);

  // Step 2: Add a product to the cart
  await inventoryPage.verifyInventoryPage();
  await inventoryPage.addBackpackToCart();
  await inventoryPage.clickAddCartBtn();

  // Step 3: Proceed to checkout
  await cartPage.verifyProductInCart("Sauce Labs Backpack");
  await cartPage.clickCheckout();

  // Step 4: Verify the "Your Information" page
  await yourInfoPage.verifyYourInfoPage();
  await yourInfoPage.verifyElementsVisibility();

  console.log("✅ Atomic test -  Your Info page.");
});
