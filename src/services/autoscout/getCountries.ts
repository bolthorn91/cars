import { getBrowserInstance } from "src/services/getBrowserInstance";
import { navigateOnTab } from "../navigateOnTab";

export const getCountries = async (): Promise<string[]> => {
    const {context, browser} = await getBrowserInstance();
    const page = await navigateOnTab(context, `https://www.autoscout24.es/lst/`)
    await page.waitForSelector('[id="country-input"]')
    const brandFilter = page.locator('[id="country-input"]')
    await brandFilter.click();
    await page.waitForSelector('[class^="suggestion-item"]')
    const suggestionOptions = await page.locator('[class^="suggestion-item"]').all()
    const suggestionsTextPromises = suggestionOptions.map(async (suggestionOption) => {
        const text = await suggestionOption.innerText()
        return text;
    })
    const rawCountries = await Promise.all(suggestionsTextPromises)
    browser.close();
    return rawCountries;
}