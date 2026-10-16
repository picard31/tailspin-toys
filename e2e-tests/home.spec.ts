import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display the correct title', async ({ page }) => {
        await expect(page).toHaveTitle('Tailspin Toys - Crowdfunding your new favorite game!');
    });

    test('should display the main heading', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Welcome to Tailspin Toys', exact: true })).toBeVisible();
    });

    test('should display the site branding in header', async ({ page }) => {
        await expect(page.getByText('Tailspin Toys').first()).toBeVisible();
    });

    test('should display the welcome message', async ({ page }) => {
        await expect(page.getByText('Find your next game! And maybe even back one! Explore our collection!')).toBeVisible();
    });
});
