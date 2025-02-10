import { expect } from "@playwright/test";

class Checkout {
  constructor(page) {
    this.page = page;
    this.checkout_total = page.locator('//div[@class="summary_total_label"]');
    this.finish_btn = page.locator('//button[@id="finish"]');
  }

  async verifyCheckoutTotal() {
    await expect(this.checkout_total).toBeVisible();
    await expect(this.checkout_total).toContainText("Total: $");
  }

  async clickFinish() {
    if (await this.finish_btn.isVisible()) {
      await this.finish_btn.click();
    } else {
      console.log("Finish button is not visible.");
    }
  }
}

export { Checkout };
