import { getBrowserInstance } from "src/services/getBrowserInstance";
import { navigateOnTab } from 'src/services/navigateOnTab';

export const getModelsByBrand = async (brand: string): Promise<string[]> => {
    const {context, browser} = await getBrowserInstance();
    const page = await navigateOnTab(context, `https://www.autoscout24.es/lst/${brand}`)
    await page.waitForSelector('[id^="model-input"]')
    const brandFilter = page.locator('[id^="model-input"]')
    await brandFilter.click();
    await page.waitForSelector('[class^="suggestion-item"]')
    const suggestionOptions = await page.locator('[class^="suggestion-item"]').all()
    const suggestionsTextPromises = suggestionOptions.map(async (suggestionOption) => {
        const text = await suggestionOption.innerText()
        return text;
    })
    const rawModels = await Promise.all(suggestionsTextPromises)
    browser.close();
    return rawModels;
}