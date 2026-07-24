import { test, expect } from '@playwright/test'

test('logs in and lands on onboarding for a new account', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('textbox', { name: 'Email' }).fill('ben@gmail.com')
  await page.getByRole('textbox', { name: 'Password' }).fill('123456')
  await page.getByRole('button', { name: 'Log in' }).click()

  await expect(page).toHaveURL(/\/onboarding/)
  await expect(page.getByRole('heading', { name: "Let's set your goal" })).toBeVisible()

  await page.screenshot({ path: 'logs/onboarding.png' })
})
