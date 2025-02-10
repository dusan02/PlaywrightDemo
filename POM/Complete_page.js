import { expect } from "@playwright/test";

class Complete {
  constructor(page) {
    this.page = page;
    this.complete_msg = page.locator('//h2[@class="complete-header"]');
  }

  async complete_msg_verification() {
    await expect(this.complete_msg).toBeVisible();
    await expect(this.complete_msg).toHaveText("Thank you for your order!");
  }
}

export { Complete };
