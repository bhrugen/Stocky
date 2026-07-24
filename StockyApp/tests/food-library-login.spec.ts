import { test, expect } from '@playwright/test'

test('logs in and lands on the dashboard for an onboarded account', async ({ page }) => {
  await page.context().clearCookies()
  await page.goto('/')

  await page.getByRole('textbox', { name: 'Email' }).fill('ben@gmail.com')
  await page.getByRole('textbox', { name: 'Password' }).fill('123456')
  await page.getByRole('button', { name: 'Log in' }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('link', { name: 'Today' })).toBeVisible()

  await page.screenshot({ path: 'logs/dashboard.png' })
})
