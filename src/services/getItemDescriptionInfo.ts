import { Locator } from "playwright-core"
import { IDescriptionInfo } from "src/types"
import { getDetailsFromContainer } from "./autoscout/getLocators"

export const getItemDescriptionInfo = async (_itemContainers: Locator[]): Promise<IDescriptionInfo[]> => {
    return await Promise.all<IDescriptionInfo>(_itemContainers.map(async itemContainer => {
      const headerContainer = itemContainer
        .locator('[class^="ListItem_header"]')
        .locator('[class^="ListItem_title"]')
      const descriptionContainer = itemContainer
        .locator('[class^="ListItem_listing"]')
      const link = await headerContainer.getAttribute('href')
      const title = await headerContainer.locator('h2').isVisible() && await headerContainer.locator('h2')?.innerText();
      const version = await headerContainer.locator('[class^="ListItem_version"]').isVisible() && await headerContainer.locator('[class^="ListItem_version"]')?.innerText()
      const price = await descriptionContainer.locator('[class^="Price_price"]').isVisible() && await descriptionContainer.locator('[class^="Price_price"]')?.innerText()
      const [kilometers, date, power, status, owners, transmission, consumption, emission ] = await getDetailsFromContainer(itemContainer);
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
  