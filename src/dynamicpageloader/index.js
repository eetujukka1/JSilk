import StaticPageLoader from "../staticpageloader/index.js";
import { getRandomProxy } from "../utils/helpers.js";
import { loadPage as loadDynamicPage } from "./loadPage.js";

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
    return loadDynamicPage(page, getRandomProxy(this.proxies), this.onSuccess);
  }
}

export { loadDynamicPage as loadPage };
export default DynamicPageLoader;
