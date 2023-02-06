import { load } from 'cheerio';
import { urlencoded } from 'express';
import { resolve } from 'path';
import { chromium } from 'playwright-core';
import { getHeaders } from './getHeaders';

const getTimes = async (): Promise<void> => {
  const browser = await chromium.launch({
    headless: false,
    
  });
  const context = await browser.newContext({
    extraHTTPHeaders: await getHeaders(),
  });
  const page = await context.newPage();
  await page.goto('http://example.com');
  const response = await page.evaluate(async () => {
    return await fetch('http://worldtimeapi.org/api/timezone').then((r) =>
      r.ok ? r.json() : Promise.reject(r)
    );
  });
  console.log(response);
  await browser.close();
};

const getBmw = async (): Promise<void> => {
  const browser = await chromium.launch({
    headless: false,
  });
  const context = await browser.newContext({
    extraHTTPHeaders: await getHeaders(),
  });
  const page = await context.newPage();
  const bodyWorkArray = [1, 2, 3, 4, 6]
  const bodyworkUrl = encodeURIComponent(bodyWorkArray.join(','))
  console.log({bodyworkUrl})
  const bmw320Url = `https://www.autoscout24.es/lst/bmw/320?sort=price&desc=0&body=${bodyworkUrl}`;
  await page.goto(bmw320Url);
  const locator = page.frameLocator('#gdpr-consent-notice').locator('#save')
  await locator.click()
    const response = await page.evaluate(async () => {
      // [data-testid^="first-part"]
        const listItems = document.querySelectorAll('[class^="ListItem_wrapper"]')
        console.log({listItems})
        await new Promise(r => setTimeout(r, 20000));
    })
  await browser.close();
};


// (async () => {
//   try {
//     const httpRequestHeaders = await getHeaders();
//     console.log({httpRequestHeaders});
//   } catch (error) {
//     console.log({error});    
//   }
// })()
getBmw()
