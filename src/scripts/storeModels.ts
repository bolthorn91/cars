import { getBrowserInstance } from "src/services/getBrowserInstance";
import { readJsonFile, toJsonFile } from "src/utils/files";
import { chunkArray, getSynchronousLoopPromises } from "src/utils/misc";
import countries from 'src/data/autoscout/countries.json';
import { BrowserContext } from "playwright-core";
import { AUTOSCOUT_COUNTRY_URL_VALUE } from "src/enums";
import { IDescriptionInfo } from "src/types";
import { getItemsFromPage } from "src/services/getItemsFromPage";

export const getCarsByConstraint = async (
    brand: string,
    model: string,
    country: string,
    context: BrowserContext,
  ) => {
    const url = `https://www.autoscout24.es/lst/${brand}/${model}?cy=${country}`;
    const data = await getItemsFromPage(context, url);
    const parsedData = data
        .map((item) => {
            if (!!item) {
                return ({
                    ...item,
                    creationDate: new Date().toISOString(),
                    country,
                })
            }
            return;
        })
        .filter((item) => !!item);
    return parsedData;
  }
  

export const storeBrandModelData = async (
    brand: string,
    model: string,
) => {
    try {
      const {context, browser} = await getBrowserInstance();
      const allCountryCarsTuplePromises = countries.map((_country) => async () => getCarsByConstraint(
        brand,
        model,
        AUTOSCOUT_COUNTRY_URL_VALUE[_country.toUpperCase()],
        context
      ))
      const callbacks = countries.map(() => async (result: IDescriptionInfo[]) => toJsonFile(
        JSON.stringify(result), 
        `/tmp/ads/${brand}__${model}`
      ));
      await getSynchronousLoopPromises<IDescriptionInfo>(allCountryCarsTuplePromises, callbacks);
      browser.close();
    } catch (error) {
      console.log({error})
    }
}

export const storeBrandModels = async (
    brand: string,
    models: string[] = []
) => {
    const brandModels: string[] = models.length > 0 
      ? models 
      : readJsonFile(`models/${brand}`);
    const chunkedBrandModels = chunkArray(brandModels.slice(0, 2), 2);
    const storeBrandModelDataPromises = chunkedBrandModels.map(chunkedBrandModel => async () => {
      const storeBrandModelDataPromises = chunkedBrandModel.map(model => storeBrandModelData(brand, model));
      return await Promise.all(storeBrandModelDataPromises)
    })
    await getSynchronousLoopPromises(storeBrandModelDataPromises)
}