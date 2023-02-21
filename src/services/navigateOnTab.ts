import { BrowserContext, Page } from "playwright-core";

export const navigateOnTab = async (context: BrowserContext, url: string): Promise<Page> => {
    const page = await context.newPage();
    await page.goto(url);
    const consentButtonlocator1 = page.frameLocator('#gdpr-consent-notice').locator('#save')
    if (await consentButtonlocator1.isVisible()) {
      await consentButtonlocator1.click();
    }
    const consentButtonlocator2 = page.locator('[class^=_consent-popup-inner]').locator('[class^="_consent-accept"]');
    if (await consentButtonlocator2.isVisible()) {
      await consentButtonlocator2.click();
    }
    return page;
  }
  