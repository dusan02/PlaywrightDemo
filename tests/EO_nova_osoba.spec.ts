import { test, expect } from "@playwright/test";
import { EoPage } from "../POM/EoPage.js";
import testLogger from "../utils/testLogger.js";
import { RCConfig } from "../utils/rcService.js";
import { setupGlobalHandlers } from "../utils/helpers.js";

test.describe("EO testy", () => {
  test.beforeEach(async ({ page }) => {
    await setupGlobalHandlers(page);
  });
  test("Nová EO osoba - muž", async ({ page }) => {
    const testRunId = await testLogger.logTestStart("Nová EO osoba - muž");
    const config: RCConfig = { birthYear: 2000, sex: "M" };

    try {
      const eo = new EoPage(page);
      const generatedRC = await eo.executeCompleteEOProcess(config);

      expect(generatedRC).toBeTruthy();
      await testLogger.logTestEnd(testRunId, "passed");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await testLogger.logTestEnd(testRunId, "failed", errorMessage as any);
      throw error;
    }
  });

  test("Nová EO osoba - žena", async ({ page }) => {
    const testRunId = await testLogger.logTestStart("Nová EO osoba - žena");
    const config: RCConfig = { birthYear: 1980, sex: "F" };

    try {
      const eo = new EoPage(page);
      const generatedRC = await eo.executeCompleteEOProcess(config);

      expect(generatedRC).toBeTruthy();
      await testLogger.logTestEnd(testRunId, "passed");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await testLogger.logTestEnd(testRunId, "failed", errorMessage as any);
      throw error;
    }
  });
});
