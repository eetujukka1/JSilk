import { chromium } from "playwright";
import { getPage } from "../utils/helpers.js";

function getBrowserOptions(proxy) {
  if (!proxy) {
    return { headless: true };
  }

  return {
    headless: true,
    proxy: {
      server: `http://${proxy.host}:${proxy.port}`,
      username: proxy.username,
      password: proxy.password,
    },
  };
}

async function loadPage(page, proxy = undefined, onSuccess = undefined) {
  page = getPage(page);

  let browser = null;
  try {
    browser = await chromium.launch(getBrowserOptions(proxy));
    const context = await browser.newContext();
    const playwrightPage = await context.newPage();

    const response = await playwrightPage.goto(page.url, {
      waitUntil: "networkidle",
    });

    page.content = await playwrightPage.content();
    page.lastLoaded = new Date();
    page.status = response?.status();

    await browser.close();

    if (typeof onSuccess !== "undefined") {
      onSuccess(page);
    }

    return page;
  } catch (error) {
    if (browser) {
      await browser.close();
    }

    throw new Error(`Failed to load page ${page.url} - ${error.message}`);
  }
}

export { loadPage };
