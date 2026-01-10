import { chromium } from "playwright";
import StaticPageLoader from "../staticpageloader";
import { getPage } from "../utils/helpers";

/**
 * DynamicPageLoader - Loads pages from the web that require JavaScript rendering
 * @param {Array} proxies - Array of proxy objects
 * @returns {Promise<Page>} Promise resolving to the Page object
 */
class DynamicPageLoader extends StaticPageLoader {
  /**
   * Loads a page using Playwright's Chromium browser, waiting for JavaScript to execute
   * @param {Page|string} page - Page object or URL string to load
   * @returns {Promise<Page>} Promise resolving to the Page object with content, status, and lastLoaded timestamp
   * @throws {Error} Throws an error if page loading fails
   */
  async loadPage(page) {
    page = getPage(page);

    const browserOptions = {};

    if (this.proxies && this.proxies.length > 0) {
      const proxy =
        this.proxies[Math.floor(Math.random() * this.proxies.length)];
      browserOptions.proxy = {
        server: `http://${proxy.host}:${proxy.port}`,
        username: proxy.username,
        password: proxy.password,
      };
    }

    let browser = null;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext(browserOptions);
      const playwrightPage = await context.newPage();

      const response = await playwrightPage.goto(page.url, {
        waitUntil: "networkidle",
      });

      page.content = await playwrightPage.content();
      page.lastLoaded = new Date();
      page.status = response?.status();

      await browser.close();

      this.onSuccess(page);
      return page;
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      throw new Error(`Failed to load page ${page.url} - ${error.message}`);
    }
  }
}

export default DynamicPageLoader;
