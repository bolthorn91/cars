import { BrowserContext } from "playwright-core";
import { IDescriptionInfo } from "src/types";
import { getLocatorText } from "src/utils/misc";
import { getAllPagesItems } from "./getAllPagesItems";
import { navigateOnTab } from "./navigateOnTab";

export const getItemsFromPage = async (context: BrowserContext, url: string): Promise<IDescriptionInfo[]> => {
    const page = await navigateOnTab(context, url);
    try {
        await page.waitForSelector('[class^="ListHeader_top"]');
        const headerTotalNumberText = await getLocatorText(
            page.locator('[class^="ListHeader_top"]')
            .locator('span')
            .locator('span')
            .first()
        );
        if (parseInt(headerTotalNumberText) > 0) {
            try {
                await page.waitForSelector('[class="pagination-item pagination-item--active"]');
                const descriptionInfos = await getAllPagesItems(page);
                return descriptionInfos
            } catch (error) {
                console.log('No pagination found', {error})
                try {
                    await page.waitForSelector('[class^="NoResults_wrapper"]');
                } catch (error) {
                    console.log('No results container found', {error})
                }
            } finally {
                page.close();
            }
        }
    } catch (error) {
        console.log({error}, 'getAllPagesItems failed')        
    }
    page.close();
    return [];
}