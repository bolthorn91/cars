import { getBrands } from "src/services/autoscout/getBrands"
import { toJsonFile } from "src/utils/files";

export const getAutoScoutBrands = async (): Promise<any> => {
    const brands = getBrands();
    const dataString = JSON.stringify(brands);
    console.log({brands})
    await toJsonFile(dataString, 'brands');
}