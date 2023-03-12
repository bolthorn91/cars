import { IAd } from "src/types";
import { readAllDirFiles, writeAllDirFiles } from "src/utils/files";
import { getUniqueListByKey } from "src/utils/misc";


export const sanitizeStoredData = async (dir: string): Promise<void> => {
    const adsTuple: IAd[][] = readAllDirFiles(dir);
    const filteredArraysTuple = await Promise.all(
        adsTuple.map(ads => getUniqueListByKey(ads, 'link'))
    );
    writeAllDirFiles(dir, filteredArraysTuple);
}