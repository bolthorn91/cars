import { Locator } from "playwright-core";

export const getRamdonNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min) + min)
export const getRandomPopularBrands = (brands: string[], maxBrands = 10): string[]  => brands.slice(0, getRamdonNumber(1, maxBrands));

export const getSynchronousLoopPromises = async<T> (promises: (() => Promise<any>)[], callback?: any): Promise<(T | any)[]> => {
    console.log({promises})
    const results = [];
    for (const [index, promise] of promises.entries()) {
      const result = await promise();
      if (callback) {
        await callback[index](result);
      }
      results.push(result);
    }
    return results;
}

export const chunkArray = (arr: any[], size: number) => {
    const chunked = arr.map((_, index: number) => index % size === 0 
      ? arr.slice(index, index + size) 
      : null
    ).filter((item: any) => item);
    return chunked;
  }

export const getLocatorText = async (locator: Locator): Promise<undefined | string> => {
    if (locator.isVisible()) {
        return await locator.innerText();
    }
    return undefined;
}

export const getArrayMapByKey = <T2>(array: Array<any>, key: string): T2 | Record<string, any>  =>
  array.reduce((acc, item) => {
    if(!acc[item[key]]) {
        return {
            ...acc,
            [item[key]]: [item]
        } 
    }
    return {
        ...acc,
        [item[key]]: [...acc[item[key]], item]
    }
  }, {});

  
export const getUniqueListByKey = <T = any[]>(arr: T[], key: string): any => {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}