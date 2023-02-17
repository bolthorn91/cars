import { getBrowserInstance } from "src/services/getBrowserInstance";
import { toJsonFile } from "src/utils/files";

export const getBrands = async (): Promise<string[]> => {
    const {context, browser} = await getBrowserInstance();
    const page = await context.newPage();
    await page.goto('https://www.autoscout24.es/lst/');
    const locator = page.frameLocator('#gdpr-consent-notice').locator('#save')
    await locator.click();
    await page.waitForSelector('#make-input-primary-filter')
    const brandFilter = page.locator('#make-input-primary-filter')
    await brandFilter.click();
    await page.waitForSelector('#make-input-primary-filter-suggestions')
    const inputSuggestionsContainer = page.locator('#make-input-primary-filter-suggestions').first()
    const suggestionOptions = await inputSuggestionsContainer.locator('li').all();
    const suggestionsTextPromises = suggestionOptions.map(async (suggestionOption) => {
        const text = await suggestionOption.innerText()
        return text;
    })
    const rawBrands = await Promise.all(suggestionsTextPromises)
    const brands = rawBrands.filter(brand => !['MARCAS DESTACADAS', 'OTRAS MARCAS'].includes(brand))
    return brands;
    browser.close();
}