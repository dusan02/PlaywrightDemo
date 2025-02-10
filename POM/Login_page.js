import { expect } from "@playwright/test";

class LoginPage {
  constructor(page) {
    this.page = page;
    this.username = '[data-test="username"]';
    this.password = '[data-test="password"]';
    this.loginButton = '[data-test="login-button"]';
    this.errorMessage = ".error-message-container";
  }

  async navigate() {
    await this.page.goto("https://www.saucedemo.com/");
  }

  async login(username, password) {
    await this.navigate();
    if (!username || !password) {
      throw new Error(
        `Username or password is undefined! Username: ${username}, Password: ${password}`
      );
    }
    await this.page.fill(this.username, username);
    await this.page.fill(this.password, password);
    await this.page.click(this.loginButton);
  }

  async verifyLoginSuccess() {
    await expect(this.page).toHaveURL(/inventory/);
  }

  async verifyErrorMessage(expectedMessage) {
    const errorMessageLocator = this.page.locator(this.errorMessage);
    await expect(errorMessageLocator).toBeVisible();
    await expect(errorMessageLocator).toHaveText(expectedMessage);
  }

  async closeErrorMessage() {
    await this.page.locator(".error-button").click();
  }
}

export { LoginPage };
