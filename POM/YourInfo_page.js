import { expect } from "@playwright/test";

class YourInfo {
  constructor(page) {
    this.page = page;
    this.title = page.locator('//span[@class="title"]');
    this.logo = page.locator("//div[@class='app_logo']");
    this.cancel_btn = page.locator("//button[@id='cancel']");
    this.continue_btn = page.locator("//input[@id='continue']");
    this.firstName = page.locator("//input[@placeholder='First Name']");
    this.lastName = page.locator("//input[@placeholder='Last Name']");
    this.zipCode = page.locator("//input[@placeholder='Zip/Postal Code']");
  }

  async verifyYourInfoPage() {
    await expect(this.page).toHaveURL(/.*checkout-step-one/);
    await expect(this.title).toBeVisible();
    await expect(this.title).toHaveText("Checkout: Your Information");
    await expect(this.logo).toBeVisible();
  }

  async clickContinue() {
    if (await this.continue_btn.isVisible()) {
      await this.continue_btn.click();
    } else {
      console.log("Continue button is not visible.");
    }
  }

  async clickCancel() {
    if (await this.cancel_btn.isVisible()) {
      await this.cancel_btn.click();
    } else {
      console.log("Cancel button is not visible.");
    }
  }

  async fillFirstName(firstName) {
    await this.firstName.fill(firstName);
  }

  async fillLastName(lastName) {
    await this.lastName.fill(lastName);
  }

  async fillZipCode(zipCode) {
    await this.zipCode.fill(zipCode);
  }

  async verifyElementsVisibility() {
    await expect(this.logo).toBeVisible();
    await expect(this.cancel_btn).toBeVisible();
    await expect(this.continue_btn).toBeVisible();
    await expect(this.firstName).toBeVisible();
    await expect(this.lastName).toBeVisible();
    await expect(this.zipCode).toBeVisible();
  }
}

export { YourInfo };
