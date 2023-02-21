import brands from 'src/data/autoscout/brands.json';
import { getBrowserInstance } from "src/services/getBrowserInstance";
import { getItemsFromPage } from 'src/services/getItemsFromPage';
import { IDescriptionInfo } from "src/types";
import { toJsonFile } from 'src/utils/files';


export const scrappingPopularBrands = async (
    quantity: number,
): Promise<IDescriptionInfo[][]> => {
    try {
        const {context, browser} = await getBrowserInstance();
        // const popularBrands = getRandomPopularBrands(brands);
        const popularBrands = brands.slice(0, quantity);
        const popularBrandsUrls = popularBrands.map((brand) => `https://www.autoscout24.es/lst/${brand}`);
        const popularBrandsUrlsPromises = popularBrandsUrls.map(async (url) => getItemsFromPage(context, url));
        const popularBrandAdsTuple = await Promise.all(popularBrandsUrlsPromises);
        console.log({popularBrandAdsTuple});
        browser.close();
        return popularBrandAdsTuple;        
    } catch (error) {
        console.log({error})
    }
};

export const storePopularBrands = async(quantity = 2) => {
    const popularAds = await scrappingPopularBrands(quantity);
    popularAds.map((popularAd, index) => toJsonFile(JSON.stringify(popularAd), `popularAds${index + 1}`));
}