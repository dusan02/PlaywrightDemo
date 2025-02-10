import { expect } from "@playwright/test";

class Cart {
  constructor(page) {
    this.page = page;
    this.title = page.locator('//span[@class="title"]');
    this.checkout_btn = page.locator("//button[@id='checkout']");
  }

  async verifyCartPage() {
    await expect(this.page).toHaveURL(/.*cart/);
  }

  async clickCheckout() {
    if (await this.checkout_btn.isVisible()) {
      await this.checkout_btn.click();
    } else {
      console.log("Checkout button is not visible.");
    }
  }

  async verifyProductInCart(productName) {
    const product = this.page.locator(`.cart_item:has-text("${productName}")`);
    await expect(product).toBeVisible();
  }
}

export { Cart };
