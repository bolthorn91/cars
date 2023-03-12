import { readAllDirFiles } from '../utils/files';
import { IDescriptionInfo, IAd } from '../types';
import { AUTOSCOUT_COUNTRY_URL_VALUE } from '../enums';
import { chunkArray, getArrayMapByKey } from 'src/utils/misc';

interface IAdMapByCountry {
    [country: string]: IAd[]
}

const getComparisonCondition = () => (item: IAd, itemToCompare: IAd) => {
    if (item.title === itemToCompare.title 
        && item.price < itemToCompare.price
    ) {
        return true;
    }
    return false
}

const filterFromArrays = async <T>(arr1: T[], arr2: T[], condition:(...args: any[]) => boolean): Promise<T[]> => {
    const largerCondition = arr1.length > arr2.length;
    const largerArray = largerCondition ? arr1 : arr2;
    const smallerArray = !largerCondition ? arr1 : arr2;
    const chunkedLargerArray = chunkArray(largerArray, 500);
    const chunkedSmallerArray = chunkArray(smallerArray, 500);
    const filteredTupleArray = chunkedLargerArray.map((largerArray) => {
        return new Promise(resolve => {
            let foundItem;
            resolve(largerArray.filter((largerItem) => {
                return chunkedSmallerArray.some((smallerArray) => {
                    return smallerArray.some((smallerItem) => {
                        if (condition(smallerItem, largerItem)) {
                            foundItem = smallerItem;
                        }
                        return condition(smallerItem, largerItem)
                    })
                })
            }).map((item) => ({...item, foundItem})))
        });
    })
    const filteredArray = (await Promise.all(filteredTupleArray)).flat();
    return filteredArray as any;
}

export const storeComparison = async (): Promise<any> => {
    const adsTuple: IAd[][] = readAllDirFiles('tmp/ads');
    const filteredArraysTuplePromises = adsTuple.map(async ads => {
        const adMapByTitle: IAdMapByCountry = getArrayMapByKey(ads, 'country');
        const spanishAds = adMapByTitle[AUTOSCOUT_COUNTRY_URL_VALUE.ESPAÑA];
        if (spanishAds && spanishAds.length > 0) {
            const filteredTuple = Object
                .keys(adMapByTitle)
                .filter(key => key !== AUTOSCOUT_COUNTRY_URL_VALUE.ESPAÑA && adMapByTitle[key] && adMapByTitle[key].length > 0)
                .map(async key => filterFromArrays<IAd>(spanishAds, adMapByTitle[key], getComparisonCondition()))
            const filteredArray = (await Promise.all(filteredTuple)).flat();
            return filteredArray;
        }
        return []
    })
    const filteredArrays = (await Promise.all(filteredArraysTuplePromises)).flat();
    console.log({filteredArrays});
}