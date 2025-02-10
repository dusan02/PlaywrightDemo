import { test, expect } from "@playwright/test";
import { LoginPage } from "../POM/Login_page.js";
import { Inventory } from "../POM/Inventory_page.js";
import { Cart } from "../POM/Cart_page.js";
import { YourInfo } from "../POM/YourInfo_page.js";
import { Checkout } from "../POM/Checkout_page.js";
import { Complete } from "../POM/Complete_page.js";

test("test 2 items to cart and proceed to checkout", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new Inventory(page);
  const cartPage = new Cart(page);
  const yourInfoPage = new YourInfo(page);
  const checkout = new Checkout(page);
  const complete = new Complete(page);

  await loginPage.login(process.env.STANDARD_USER, process.env.PASSWORD);
  await inventoryPage.verifyInventoryPage();
  await inventoryPage.addBackpackToCart();
  await inventoryPage.addBikeLightToCart();
  await inventoryPage.clickAddCartBtn();

  await cartPage.verifyProductInCart("Sauce Labs Backpack");
  await cartPage.verifyProductInCart("Sauce Labs Bike Light");

  await cartPage.clickCheckout();
  await yourInfoPage.verifyYourInfoPage();
  await yourInfoPage.fillFirstName("Tom");
  await yourInfoPage.fillLastName("Smith");
  await yourInfoPage.fillZipCode("44B 777");
  await yourInfoPage.clickContinue();
  await checkout.verifyCheckoutTotal();
  await checkout.clickFinish();
  await complete.complete_msg_verification();

  console.log("✅ E2E test");
});
