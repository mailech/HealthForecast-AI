// Playwright E2E Spec: Critical Clinical Workflow Journey
// Run: npx playwright test

const { test, expect } = require("@playwright/test");

test.describe("Critical Clinical Flow E2E Spec", () => {
  test("Complete Clinical Journey: Login -> Predict Risk -> Resolve Breach Alert", async ({ page }) => {
    // 1. Navigate to Login page
    await page.goto("http://localhost:5173/");
    await expect(page.locator("h1")).toContainText("HealthForecast");

    // 2. Perform Login Action
    await page.click('button:has-text("Sign In to Portal")');

    // 3. Verify Dashboard Access
    await expect(page).toHaveURL("http://localhost:5173/dashboard");
    await expect(page.locator("h1")).toContainText("Clinical Executive Overview");

    // 4. Navigate to Prediction Page
    await page.click('a:has-text("Prediction")');
    await expect(page).toHaveURL("http://localhost:5173/prediction");

    // 5. Fill Patient Parameters & Predict
    await page.fill('input[placeholder*="Rahul Verma"]', "Test E2E Patient");
    await page.click('button:has-text("Calculate Readmission Risk")');

    // 6. Verify Prediction Score Card Appears
    await expect(page.locator("h2")).toContainText("Prediction Summary");

    // 7. Navigate to Alerts & Resolve Trigger
    await page.click('a:has-text("Alerts")');
    await expect(page).toHaveURL("http://localhost:5173/alerts");
    await expect(page.locator("h1")).toContainText("Hospital Alerts");
  });
});
