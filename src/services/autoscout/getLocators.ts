import { Locator } from "playwright-core";

export const getDetailsFromContainer = async (
    parentContainer: Locator,
): Promise<string[]> => {
    const detailContainerVersion1 = parentContainer
        .locator('[class^="VehicleDetailTable_container"]')
    const detailContainerVersion2 = parentContainer
        .locator('[class^="VehicleDetailTableNewDesign_container"]')
    if (await detailContainerVersion1.isVisible()) {
        return await getDetailsTextsVersion1(await detailContainerVersion1.locator('[class^="VehicleDetailTable_item"]').all())
    }
    if (await detailContainerVersion2.isVisible()) {
        return await getDetailsTextsVersion2(await detailContainerVersion2.locator('[class^="VehicleDetailTableNewDesign_item"]').all())
    }
    return ['','','','','','','',''];
}

export const getDetailsTextsVersion1 = async (
    tableItemLocators: Locator[],
): Promise<string[]> => {
    const [kilometers, date, power, status, owners, transmission, consumption, emission ] = await Promise.all(tableItemLocators.map(async tableItemLocator => {
        if (await tableItemLocator.isVisible()) {
          const tableItemLocatorText = await tableItemLocator.innerText()
          if (tableItemLocatorText.includes('- ')) {
            return '';
          }
          return tableItemLocatorText;
        }
        return '';
    }));
    return [kilometers, date, power, status, owners, transmission, consumption, emission ]
}

export const getDetailsTextsVersion2 = async (
    tableItemLocators: Locator[],
): Promise<string[]> => {
    const [kilometers, transmission, date, consumption, power ] = await Promise.all(tableItemLocators.map(async tableItemLocator => {
        if (await tableItemLocator.isVisible()) {
          const tableItemLocatorText = await tableItemLocator.innerText()
          if (tableItemLocatorText.includes('- ')) {
            return '';
          }
          return tableItemLocatorText;
        }
        return '';
    }));
    return [kilometers, date, power, '', '', transmission, consumption, '' ]
}