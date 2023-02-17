import { mkdir, writeFileSync } from "fs";
import { join } from "path";

export const ensureDirectory = (path: string) => new Promise((resolve, reject) => {
    return mkdir(path, (err) => {
        if (err) {
            if (err.code == 'EEXIST') return resolve(null);
            return reject(err);
        }
        resolve(null);
    });
});

export const toJsonFile = async (data: string, fileName: string): Promise<void> => {
    const dir = join(process.cwd(), 'src', 'data', 'autoscout');
    try {
        await ensureDirectory(dir);
    } catch (err) {
        console.error(err);
    }
    const filePath = join(dir, `${fileName}.json`);
    writeFileSync(filePath, data);
}