import { readJsonFile } from './../utils/files';
import { getBrowserInstance } from "src/services/getBrowserInstance";
import { toJsonFile } from "src/utils/files";
import { AUTOSCOUT_COUNTRY_URL_VALUE } from '../enums';
import countries from 'src/data/autoscout/countries.json';
import { BrowserContext } from "playwright-core";
import { chunkArray, getSynchronousLoopPromises } from 'src/utils/misc';
import { IDescriptionInfo } from '../types';
import { getItemsFromPage } from 'src/services/getItemsFromPage';

const getCarsByConstraint = async (
  brand: string,
  model: string,
  country: string,
  context: BrowserContext,
) => {
  const url = `https://www.autoscout24.es/lst/${brand}/${model}?cy=${country}`;
  const data = await getItemsFromPage(context, url);
  const parsedData = data.map((item: any) => ({
    ...item,
    creationDate: new Date().toISOString(),
    country,
  }));  
  return parsedData;
}

const parseModelStringToAutoScoutUrl = (model: string) => model.replaceAll(' ', '-').toLowerCase();

const storeScrappingModels = async (
  modelsMap: Record<string, string[]> = {},
) => {
  const brands = Object.keys(modelsMap);
  const selectedBrands: string[] = brands.length > 0 
    ? brands.map(parseModelStringToAutoScoutUrl) 
    : readJsonFile('brands').map(parseModelStringToAutoScoutUrl);
  const storeAllBrandModelsPromises = selectedBrands.map(brand => async () => {
    const brandModels = modelsMap[brand] || readJsonFile(`models/${brand}`);
    return storeBrandModels(brand, brandModels)
  })
  await getSynchronousLoopPromises(storeAllBrandModelsPromises)
}

// const storeComparisonScrappingData = async () => {
//   const dir = 'src/data/autoscout/models';
//   const readAllFiles = (dir: string) => readdirSync(dir).map((file) => readJsonFile(file));
//   const {context, browser} = await getBrowserInstance();
//   const brands = readJsonFile('brands');
//   const models = readJsonFile('models');
//   const allBrandModelPromises = brands.map((brand, index) => async () => {
//     const brandModels = models[index];
//     const brandModelPromises = brandModels.map((model) => async () => storeBrandModelData(brand, model));
//     await getSynchronousLoopPromises(brandModelPromises);
//   });
//   await getSynchronousLoopPromises(allBrandModelPromises);
//   browser.close();
// }

const storeComparisonData = async (
  modelsMap: Record<string, string[]> = {},
) => {
  await storeScrappingModels(modelsMap);
  // await storeComparisonScrappingData();
}

const storeBrandModelData = async (
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

const storeBrandModels = async (
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

storeComparisonData({
  audi: ['a3'],
});

