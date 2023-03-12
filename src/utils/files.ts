import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join, dirname } from "path";

export const ensureDirectory = (path: string) => existsSync(path) || mkdirSync(path, { recursive: true });

export const toJsonFile = async (data: string, fileName: string, overwrite = false): Promise<void> => {
    const dir = join(process.cwd(), 'src', 'data', 'autoscout');
    ensureDirectory(dir);
    const filePath = join(dir, `${fileName}.json`);
    dirname(filePath) && ensureDirectory(dirname(filePath));
    if (!overwrite && existsSync(filePath)) {
        const existentData = JSON.parse(readFileSync(filePath, 'utf8'));
        return writeFileSync(filePath, JSON.stringify([...existentData, ...JSON.parse(data)]));
    }
    return writeFileSync(filePath, data);
}

export const deleteAllTempFiles = () => {
    const dir = join(process.cwd(), 'src', 'data', 'autoscout', 'tmp');
    rmSync(dir, { recursive: true, force: true })
}

export const deleteComparisonsDir = () => {
    const dir = join(process.cwd(), 'src', 'data', 'autoscout', 'tmp', 'comparisons');
    rmSync(dir, { recursive: true, force: true })
}

export const deleteAdsDir = () => {
    const dir = join(process.cwd(), 'src', 'data', 'autoscout', 'tmp', 'ads');
    rmSync(dir, { recursive: true, force: true })
}

export const createTempDir = () => {
    const dir = join(process.cwd(), 'src', 'data', 'autoscout', 'tmp');
    ensureDirectory(dir);
    mkdirSync(dir, { recursive: true });
}

export const createComparisonsDir = () => {
    const dir = join(process.cwd(), 'src', 'data', 'autoscout', 'tmp', 'comparisons');
    ensureDirectory(dir);
    mkdirSync(dir, { recursive: true });
}

export const createAdsDir = () => {
    const dir = join(process.cwd(), 'src', 'data', 'autoscout', 'tmp', 'ads');
    ensureDirectory(dir);
    mkdirSync(dir, { recursive: true });
}

export const readJsonFile = (fileName: string): any => {
    const dir = join(process.cwd(), 'src', 'data', 'autoscout');
    const filePath = join(dir, `${fileName}.json`);
    const json = readFileSync(filePath, 'utf8');
    return JSON.parse(json);
}

export const readAllDirFiles = (dir: string): any[] => {
    const dirPath = join(process.cwd(), 'src', 'data', 'autoscout', dir);
    const files = readdirSync(dirPath).map((file) => readJsonFile(`${dir}/${file.split('.json')[0]}`));
    return files;
}

export const writeAllDirFiles = (dir: string, newData: any[][]): any[] => {
    const dirPath = join(process.cwd(), 'src', 'data', 'autoscout', dir);
    const files = readdirSync(dirPath).map((file, index) => toJsonFile(
        JSON.stringify(newData[index]),
        `${dir}${file.split('.json')[0]}`,
        true
    ));
    return files;
}
