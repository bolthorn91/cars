import { BrowserContext, Page } from "playwright-core";
import { IDescriptionInfo } from "src/types";
import { getLocatorText } from "src/utils/misc";
import { getAllPagesItems } from "./getAllPagesItems";
import { navigateOnTab } from "./navigateOnTab";
import { getSynchronousLoopPromises } from '../utils/misc';

const getTotalItemsText = async (page: Page): Promise<number> => {
    await page.waitForSelector('[class^="ListHeader_top"]');
    const headerTotalNumberText = await getLocatorText(
        page.locator('[class^="ListHeader_top"]')
        .locator('span')
        .locator('span')
        .first()
    );
    return parseInt(headerTotalNumberText);
}

const getCalculatedDateFilterNumbers = async (
    dateFilterNumbers: number[], 
    currentIndex: number,
    page: Page,
    url: string,
    context: BrowserContext,
    indexToCheck = 0,
): Promise<number[]> => {
    if (dateFilterNumbers.length > 0) {
        const toFilter = dateFilterNumbers[currentIndex];
        const fromFilter = dateFilterNumbers[currentIndex + 1];
        await page.close();
        const urlFilter = `fregto=${toFilter}&fregfrom=${fromFilter}`;
        const newPage = await navigateOnTab(context, `${url}&${urlFilter}`);
        if (!!fromFilter) {
            const headerTotalNumber = await getTotalItemsText(newPage);
            if (headerTotalNumber > 400) {
                if (toFilter !== fromFilter) {
                    dateFilterNumbers.push(fromFilter + 1)
                    dateFilterNumbers.sort((a, b) => b - a);
                }
                const nextIndexToCheck = indexToCheck + 1;
                const nextCurrentIndex = toFilter === fromFilter
                    ? nextIndexToCheck
                    : currentIndex;
                return getCalculatedDateFilterNumbers(dateFilterNumbers, nextCurrentIndex, newPage, url, context, nextIndexToCheck);
            }
            return getCalculatedDateFilterNumbers(dateFilterNumbers, indexToCheck + 1, newPage, url, context, indexToCheck + 1);
        }
    }
    return dateFilterNumbers;
}

const getDateFiltersRanges = async (
    dateFilterNumbers: number[], 
    currentIndex: number,
    page: Page,
    url: string,
    context: BrowserContext,
    indexToCheck = 0,
): Promise<number[]> => {
    const dateFiltersRanges = await getCalculatedDateFilterNumbers(dateFilterNumbers, currentIndex, page, url, context, indexToCheck);
    const uniqueDateFilterRanges = [...new Set(dateFiltersRanges)];
    return uniqueDateFilterRanges;
}

const getInitialDateFilterNumbers = (
    toDate = new Date().getFullYear(),
    fromDate = 1950,
    difference = 5,
): number[] => {
    const years: number[] = Array
        .from({length: toDate - fromDate}, (_, i) => {
            if (i % difference === 0) {
                return toDate - i;
            }
            return undefined
        })
        .filter(item => !!item)
    return years
}

const getUrlDateFilters = (dateFilterNumbers: number[]): string[] => {
    return dateFilterNumbers.reduce((acc, current, index) => {
        const nextValue = dateFilterNumbers[index + 1];
        if (current && nextValue === current - 1) {
            return [...acc, `fregto=${current}&fregfrom=${current}`];
        }
        return [...acc, `fregto=${current}&fregfrom=${nextValue}`]
    }, []);
}

export const getItemsFromPage = async (context: BrowserContext, url: string): Promise<IDescriptionInfo[]> => {
    const page = await navigateOnTab(context, url);
    try {
        const headerTotalNumber = await getTotalItemsText(page);
        if (headerTotalNumber > 0) {
            if (headerTotalNumber > 400) {
                return await useDateFilters(context, url, page);
            }
            return await getItemsFromActivePage(page);
        }
    } catch (error) {
        console.log({error}, 'getAllPagesItems failed')        
    }
    page.close();
    return [];
}

const useDateFilters = async (
    context: BrowserContext,
    url: string,
    currentPage: Page,
): Promise<IDescriptionInfo[]> => {
    const headerTotalNumber = await getTotalItemsText(currentPage);
    if (headerTotalNumber > 0) {
        if (headerTotalNumber > 400) {
            const dateFiltersNumbers = getInitialDateFilterNumbers();
            const newDateFilters = await getDateFiltersRanges(dateFiltersNumbers, 0, currentPage, url, context);
            const urlDateFilters = getUrlDateFilters(newDateFilters);
            return await getItemsWithDateFilters(context, url, urlDateFilters);
        }
        return await getItemsFromActivePage(currentPage);
    }
}

const getItemsWithDateFilters = async (
    context: BrowserContext,
    url: string,
    urlDateFilters: string[],
): Promise<IDescriptionInfo[]> => {
    const result = await getSynchronousLoopPromises(urlDateFilters.map(urlDateFilter => async () => {
        const urlWithDate = `${url}&${urlDateFilter}`
        const page = await navigateOnTab(context, urlWithDate);
        return await getItemsFromActivePage(page);
    }));
    return result
}

const getItemsFromActivePage = async (page: Page): Promise<IDescriptionInfo[]> => {
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