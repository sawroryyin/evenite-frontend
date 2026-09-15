import { test, expect } from "@playwright/test";

test.describe("Participant send message", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/auth/login');
    await page.locator('input[type="email"]').click();
    await page.locator('input[type="email"]').fill('participant2@cmu.ac.th');
    await page.locator('input[type="password"]').click();
    await page.locator('input[type="password"]').fill('12345678');
    await page.getByRole('button', { name: 'Log In' }).click();
  });

  test("send message successful", async ({ page }) => {
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(5).click();
    await page.getByRole('heading', { name: 'Semester Exchange Program 2026' }).click();
    await page.getByRole('textbox', { name: 'Type your message...' }).click();
    await page.getByRole('textbox', { name: 'Type your message...' }).fill('Sawadee');
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();

    await expect(page.locator('div').filter({ hasText: /^Sawadee$/ }).last()).toBeVisible();
  });

  test("send message to archived", async ({ page }) => {
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(5).click();
    await page.getByRole('button', { name: 'archived' }).click();
    await page.getByRole('heading', { name: 'SE Hackathon' }).click();
    
    const messageTextbox = page.getByRole('textbox', { name: 'Type your message...' });
    const sendButton = messageTextbox.locator('xpath=following-sibling::button');

    await expect(page.getByText('Archived')).toBeVisible();
    await expect(sendButton).toBeDisabled();
    await expect(messageTextbox).toBeDisabled();
  });

  test("send message over 2000 char", async ({ page }) => {
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(5).click();
    await page.getByRole('heading', { name: 'Semester Exchange Program 2026' }).click();
    await page.getByRole('textbox', { name: 'Type your message...' }).click();
    await page.getByRole('textbox', { name: 'Type your message...' }).fill('S'.repeat(2001));
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();

    await expect(page.getByRole('heading', { name: 'Alert' })).toBeVisible();
    await expect(page.getByText('Message cannot exceed 2000')).toBeVisible();
  });
});
