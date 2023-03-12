import { readJsonFile } from './../utils/files';
import { getSynchronousLoopPromises } from 'src/utils/misc';
import { storeBrandModels } from './storeModels';
import { storeComparison } from './storeComparisons';
import { sanitizeStoredData } from './sanitizeStoredData';

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

const storeComparisonData = async (
  modelsMap: Record<string, string[]> = {},
) => {
  await storeScrappingModels(modelsMap);
  await storeComparison();
  sanitizeStoredData('/tmp/ads/');
}

storeComparisonData()