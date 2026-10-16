import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
    test('home page should not have accessibility violations', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('game details page should not have accessibility violations', async ({ page }) => {
        await page.goto('/game/1');
        await page.waitForSelector('[data-testid="game-details"]', { timeout: 10000 });

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('about page should not have accessibility violations', async ({ page }) => {
        await page.goto('/about');
        await page.waitForSelector('[data-testid="about-section"]', { timeout: 10000 });

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('keyboard navigation - should be able to navigate header menu', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });

        const menuButton = page.getByRole('button', { name: /toggle menu/i });
        const menu = page.locator('#menu');

        await test.step('Tab until the menu button is focused', async () => {
            for (let i = 0; i < 20; i++) {
                await page.keyboard.press('Tab');
                if (await menuButton.evaluate(el => el === document.activeElement)) break;
            }
            await expect(menuButton).toBeFocused();
        });

        await test.step('Open menu with Enter and verify it is visible', async () => {
            await page.keyboard.press('Enter');
            await expect(menu).not.toHaveClass(/hidden/);
        });

        await test.step('Verify menu items are reachable', async () => {
            const homeLink = menu.getByRole('link', { name: /home/i });
            // Focus may already be on the first menu item after opening
            if (!await homeLink.evaluate(el => el === document.activeElement)) {
                for (let i = 0; i < 10; i++) {
                    await page.keyboard.press('Tab');
                    if (await homeLink.evaluate(el => el === document.activeElement)) break;
                }
            }
            await expect(homeLink).toBeFocused();

            const aboutLink = menu.getByRole('link', { name: /about/i });
            for (let i = 0; i < 10; i++) {
                await page.keyboard.press('Tab');
                if (await aboutLink.evaluate(el => el === document.activeElement)) break;
            }
            await expect(aboutLink).toBeFocused();
        });
    });

    test('keyboard navigation - should be able to navigate to game cards', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });

        await test.step('Tab through page until a game card receives focus', async () => {
            const MAX_TABS = 50;
            let tabCount = 0;

            await expect.poll(async () => {
                if (tabCount < MAX_TABS) {
                    await page.keyboard.press('Tab');
                    tabCount++;
                }
                return page.locator('[data-testid="game-card"]:focus').count();
            }, { timeout: 15000, message: 'Expected a game card to receive focus via Tab' }).toBeGreaterThan(0);
        });
    });

    test('keyboard navigation - should be able to activate game card with Enter', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });

        let gameId: string | null = null;

        await test.step('Tab to a game card using real keyboard navigation', async () => {
            let tabCount = 0;
            let gameCardFocused = false;

            while (tabCount < 20 && !gameCardFocused) {
                await page.keyboard.press('Tab');
                tabCount++;

                const focusedElement = page.locator(':focus');
                const testId = await focusedElement.getAttribute('data-testid').catch(() => null);

                if (testId === 'game-card') {
                    gameId = await focusedElement.getAttribute('data-game-id');
                    gameCardFocused = true;
                }
            }

            expect(gameCardFocused).toBeTruthy();
            expect(gameId).not.toBeNull();
        });

        await test.step('Press Enter and verify navigation to game page', async () => {
            await page.keyboard.press('Enter');
            await expect(page).toHaveURL(`/game/${gameId}`);
        });
    });

    test('focus indicators - should have visible focus indicators on interactive elements', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });

        const menuButton = page.locator('#menu-toggle');
        await menuButton.focus();

        const hasVisibleFocus = await menuButton.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            const outline = styles.outline;
            const outlineWidth = styles.outlineWidth;
            const boxShadow = styles.boxShadow;

            return (outline !== 'none' && outlineWidth !== '0px') || boxShadow !== 'none';
        });

        expect(hasVisibleFocus).toBeTruthy();
    });

    test('ARIA labels - header menu should have proper ARIA attributes', async ({ page }) => {
        await page.goto('/');

        const menuButton = page.locator('#menu-toggle');
        const hasAriaLabel = await menuButton.evaluate((el) => {
            return el.hasAttribute('aria-label') ||
                el.hasAttribute('aria-labelledby') ||
                el.hasAttribute('aria-describedby');
        });

        const menuIcon = menuButton.locator('svg');
        const svgAccessible = await menuIcon.evaluate((el) => {
            return el.hasAttribute('role') ||
                el.hasAttribute('aria-label') ||
                el.querySelector('title') !== null;
        });

        expect(hasAriaLabel || svgAccessible).toBeTruthy();
    });

    test('color contrast - should meet WCAG AA standards', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2aa'])
            .include('body')
            .analyze();

        const contrastViolations = accessibilityScanResults.violations.filter(
            violation => violation.id === 'color-contrast',
        );

        expect(contrastViolations).toEqual([]);
    });

    test('semantic HTML - main landmarks should be present', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });

        // first(): dev tools can add a second header, which strict mode would reject.
        const header = page.locator('header').first();
        await expect(header).toBeVisible();

        const main = page.locator('main');
        await expect(main).toBeVisible();
    });

    test('decorative SVGs should have aria-hidden attribute', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });

        const menuButtonSvg = page.locator('#menu-toggle svg');
        await expect(menuButtonSvg).toHaveAttribute('aria-hidden', 'true');

        // first(): one card is enough, since every card renders the same icons.
        const firstGameCard = page.locator('[data-testid="game-card"]').first();
        const gameCardSvgs = firstGameCard.locator('svg');
        const count = await gameCardSvgs.count();

        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(gameCardSvgs.nth(i)).toHaveAttribute('aria-hidden', 'true');
        }
    });
});
