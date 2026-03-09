// @ts-check
import { defineConfig, devices } from "@playwright/test";
import CustomReporter from "./utils/customReporter.js";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 0 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["json", { outputFile: "logs/test-results.json" }],
    ["dot"], // Jednoduchý výstup - jen tečky
  ],

  use: {
    timeout: 10 * 1000,
    actionTimeout: 30 * 1000,
    navigationTimeout: 30 * 1000,
    screenshot: "on",
    video: "off",
    trace: "on-first-retry",
  },
  timeout: 60 * 1000,
  globalTimeout: 10 * 60 * 1000,
  expect: {},

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
