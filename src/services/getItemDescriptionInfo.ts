import { Locator } from "playwright-core"
import { IDescriptionInfo } from "src/types"

export const getItemDescriptionInfo = async (_itemContainers: Locator[]): Promise<IDescriptionInfo[]> => {
    return await Promise.all<IDescriptionInfo>(_itemContainers.map(async itemContainer => {
      const headerContainer = itemContainer
        .locator('[class^="ListItem_header"]')
        .locator('[class^="ListItem_title"]')
      const descriptionContainer = itemContainer
        .locator('[class^="ListItem_listing"]')
      const detailContainer = itemContainer
        .locator('[class^="VehicleDetailTable_container"]')
      const link = await headerContainer.getAttribute('href')
      const title = await headerContainer.locator('h2').isVisible() && await headerContainer.locator('h2')?.innerText();
      const version = await headerContainer.locator('[class^="ListItem_version"]').isVisible() && await headerContainer.locator('[class^="ListItem_version"]')?.innerText()
      const price = await descriptionContainer.locator('[class^="Price_price"]').isVisible() && await descriptionContainer.locator('[class^="Price_price"]')?.innerText()
      const tableItemLocators = await detailContainer.locator('[class^="VehicleDetailTable_item"]').all()
      const [kilometers, date, power, status, owners, transmission, consumption, emission ] = await Promise.all(tableItemLocators.map(async tableItemLocator => {
        if (await tableItemLocator.isVisible()) {
          const tableItemLocatorText = await tableItemLocator.innerText()
          if (tableItemLocatorText.includes('- (')) {
            return '';
          }
          return tableItemLocatorText;
        }
        return '';
      }));
      return {
        title,
        version,
        link,
        price,
        kilometers,
        date,
        power,
        status,
        owners,
        transmission,
        consumption,
        emission
      }
    }))
  }
  