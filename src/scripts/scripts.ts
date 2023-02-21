import jsonBrands from 'src/data/autoscout/brands.json';
import { getAllAutoScoutModelsByBrands } from './getAutoScoutModelByBrand';

getAllAutoScoutModelsByBrands(jsonBrands.map((brand: any) => brand.replaceAll(' ', '-').toLowerCase()))