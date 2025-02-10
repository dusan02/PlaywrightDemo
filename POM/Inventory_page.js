import { expect } from "@playwright/test";

class Inventory {
  constructor(page) {
    this.page = page;
    this.sortingDropdown = page.locator(
      "//select[@class='product_sort_container']"
    );
    this.hamburgerMenu = page.locator("//button[@id='react-burger-menu-btn']");
    this.logoutButton = page.locator("//a[@id='logout_sidebar_link']");
    this.bikelight_btn = page.locator(
      "//button[@id='add-to-cart-sauce-labs-bike-light']"
    );
    this.backpack_btn = page.locator(
      "//button[@id='add-to-cart-sauce-labs-backpack']"
    );
    this.cart_btn = page.locator("//a[@class='shopping_cart_link']");
  }

  async verifyInventoryPage() {
    await this.page.waitForLoadState("networkidle");
    await expect(this.page).toHaveURL(/.*inventory/);
    await expect(this.page).toHaveTitle("Swag Labs");
  }

  async logoutPage() {
    try {
      if (await this.hamburgerMenu.isVisible()) {
        await this.hamburgerMenu.click();
        if (await this.logoutButton.isVisible()) {
          await this.logoutButton.click();
        } else {
          console.log("Logout button is not visible.");
        }
      } else {
        console.log("Hamburger menu is not visible, skipping logout.");
      }
    } catch (error) {
      console.error("Error during logout: ", error.message);
    }
  }

  async addBikeLightToCart() {
    if (await this.bikelight_btn.isVisible()) {
      await this.bikelight_btn.click();
    }
  }

  async addBackpackToCart() {
    if (await this.backpack_btn.isVisible()) {
      await this.backpack_btn.click();
    }
  }

  async clickAddCartBtn() {
    await this.cart_btn.click();
  }
}

export { Inventory };
