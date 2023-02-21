import { getBrowserInstance } from "src/services/getBrowserInstance";
import { navigateOnTab } from "../navigateOnTab";

export const getBrands = async (): Promise<string[]> => {
    const {context, browser} = await getBrowserInstance();
    const page = await navigateOnTab(context, `https://www.autoscout24.es/lst/`)
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
    browser.close();
    return brands;
}