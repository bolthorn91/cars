import { getBrowserInstance } from 'src/services/getBrowserInstance';
import brands from 'src/data/autoscout/brands.json'
import { Locator, Page } from 'playwright-core';
import { BrowserContext } from 'playwright';
import { toJsonFile } from 'src/utils/files';

interface IDescriptionInfo {
  title: string;
  version: string;
  link: string;
  price: string;
}

// const getBmw = async (): Promise<void> => {
//   const {context, browser} = await getBrowserInstance();
//   const page = await context.newPage();
//   const bodyWorkArray = [1, 2, 3, 4, 6]
//   const bodyworkUrl = encodeURIComponent(bodyWorkArray.join(','))
//   console.log({bodyworkUrl})
//   const bmw320Url = `https://www.autoscout24.es/lst/bmw/320?sort=price&desc=0&body=${bodyworkUrl}`;
//   await page.goto(bmw320Url);
//   const locator = page.frameLocator('#gdpr-consent-notice').locator('#save')
//   await locator.click()
//   await browser.close();
// };

const getRamdonNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min) + min)
const getRandomPopularBrands = (brands: string[], maxBrands = 10): string[]  => brands.slice(0, getRamdonNumber(1, maxBrands));

const scrappingPopularBrands = async (): Promise<IDescriptionInfo[][]> => {
  const {context, browser} = await getBrowserInstance();
  // const popularBrands = getRandomPopularBrands(brands);
  const popularBrands = brands.slice(0, 2);
  const popularBrandsUrls = popularBrands.map((brand) => `https://www.autoscout24.es/lst/${brand}`);
  const popularBrandsUrlsPromises = popularBrandsUrls.map(async (url) => {
    try {
      const page = await navigateOnTab(context, url);
      await page.waitForSelector('[class="pagination-item pagination-item--active"]');
      const descriptionInfos: IDescriptionInfo[] = [];
      descriptionInfos.push(...await getAllPagesItems(page, descriptionInfos));
      page.close();
      return descriptionInfos;
    } catch (error) {
      console.log({error})
    }
  });
  try {
    const popularBrandAdsTuple = await Promise.all(popularBrandsUrlsPromises);
    console.log({popularBrandAdsTuple});
    return popularBrandAdsTuple;
  } catch (error) {
    
  }
  browser.close();
};

export const getAllPagesItems = async (
  page: Page,
  descriptionInfos: IDescriptionInfo[],
  maxPages = undefined,
): Promise<IDescriptionInfo[]> => {
  const selectedPaginationLocator = page
    .locator('[class="pagination-item pagination-item--active"]')
    .locator('[class^="FilteredListPagination_button"]');
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
  return descriptionInfos;
}

export const getItemDescriptionInfo = async (_itemContainers: Locator[]): Promise<IDescriptionInfo[]> => {
  return await Promise.all<IDescriptionInfo>(_itemContainers.map(async itemContainer => {
    const headerContainer = itemContainer
      .locator('[class^="ListItem_header"]')
      .locator('[class^="ListItem_title"]')
    const descriptionContainer = itemContainer
      .locator('[class^="ListItem_listing"]')
    const link = await headerContainer.getAttribute('href')
    const title = await headerContainer.locator('h2').isVisible() && await headerContainer.locator('h2')?.innerText();
    const version = await headerContainer.locator('[class^="ListItem_version"]').isVisible() && await headerContainer.locator('[class^="ListItem_version"]')?.innerText()
    const price = await descriptionContainer.locator('[class^="Price_price"]').isVisible() && await descriptionContainer.locator('[class^="Price_price"]')?.innerText()
      return {
        title,
        version,
        link,
        price
    }
  }))
}

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



const getPopularBrands = async() => {
  const popularAds = await scrappingPopularBrands();
  popularAds.map((popularAd, index) => toJsonFile(JSON.stringify(popularAd), `popularAds${index + 1}`));
}

getPopularBrands();
