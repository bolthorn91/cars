import { BrowserContext } from "playwright";
import { Browser, chromium } from "playwright-core";
import { getHeaders } from "src/services/getHeaders";

interface BrowserInstance {
    browser: Browser;
    context: BrowserContext;
}

export const getBrowserInstance = async (setExtraHeaders = true): Promise<BrowserInstance> => {
    const browser = await chromium.launch({
        headless: false,
    });
    const context = await browser.newContext({
        extraHTTPHeaders: setExtraHeaders ? await getHeaders() : {},
      });
    return {
        browser,
        context
    };
}
