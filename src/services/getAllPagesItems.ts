import { Page } from "playwright-core";
import { IDescriptionInfo } from "src/types";
import { getItemDescriptionInfo } from "./getItemDescriptionInfo";

export const getAllPagesItems = async (
    page: Page,
    descriptionInfos: IDescriptionInfo[] = [],
    maxPages = undefined,
  ): Promise<IDescriptionInfo[]> => {
      const selectedPaginationLocator = page
        .locator('[class="pagination-item pagination-item--active"]')
        .locator('[class^="FilteredListPagination_button"]');
    if (selectedPaginationLocator.isVisible()) {
        const currentPagination = await selectedPaginationLocator.innerText();
        const nextPagination = (parseInt(currentPagination) + 1)
        const itemContainers = await page.locator('[class^="ListItem_wrapper"]').all()
        if (parseInt(currentPagination) >= 1 && ((maxPages > 0 && parseInt(currentPagination) <= maxPages) || !maxPages)) {
          const paginationLocators = (await page.locator('[class^="FilteredListPagination_button"]').all())
          const paginationValues = await Promise.all(paginationLocators.map(async paginationLocator => paginationLocator.innerText()));
          const index = paginationValues.findIndex(paginationValue => (paginationValue && (parseInt(paginationValue) === nextPagination)));
          const nextPaginationLocator = paginationLocators[index];
          if (nextPaginationLocator && await nextPaginationLocator.isVisible()) {
            const newDescriptionInfos = await getItemDescriptionInfo(itemContainers);
            await nextPaginationLocator.click();
            await page.waitForNavigation();
            // await page.waitForURL(`**/lst/**?page=${parseInt(currentPagination) + 1}**`);
            return getAllPagesItems(page, [...descriptionInfos, ...newDescriptionInfos]);
          }
        }
        return [...descriptionInfos, ...await getItemDescriptionInfo(itemContainers)]
    }
    return descriptionInfos;
  }