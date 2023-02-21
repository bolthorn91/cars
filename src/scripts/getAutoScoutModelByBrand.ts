import { getBrands } from "src/services/autoscout/getBrands"
import { getModelsByBrand } from "src/services/autoscout/getModelsByBrand";
import { toJsonFile } from "src/utils/files";
import { getSynchronousLoopPromises } from "src/utils/misc";

export const getAutoScoutBrands = async (): Promise<any> => {
    const brands = await getBrands();
    const dataString = JSON.stringify(brands);
    console.log({brands})
    await toJsonFile(dataString, 'brands');
}

export const getAutoScoutModelByBrand = async (brand: string): Promise<any> => {
    const models = await getModelsByBrand(brand);
    const dataString = JSON.stringify(models);
    console.log({models})
    await toJsonFile(dataString, `models/${brand}`);
}

// This method depends on the previous two methods
// getAllAutoScoutModelsByBrands(jsonBrands.map((brand: any) => brand.replaceAll(' ', '-').toLowerCase()))
export const getAllAutoScoutModelsByBrands = async (brands: string[]): Promise<any> => {
    const brandsPromises = brands.map(brand => async () => getAutoScoutModelByBrand(brand));
    await getSynchronousLoopPromises(brandsPromises)
}