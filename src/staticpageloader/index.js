import { getRandomProxy } from "../utils/helpers.js";
import { loadPage as loadStaticPage } from "./loadPage.js";

/**
 * StaticPageLoader - Loads pages from the web
 * @param {Array} proxies - Array of proxy objects
 * @returns {Promise<Page>} Promise resolving to the Page object
 */
class StaticPageLoader {
  constructor(proxies = [], onSuccess = undefined) {
    this.proxies = proxies;
    this.onSuccess = onSuccess;
  }

  async loadPage(page) {
    return loadStaticPage(page, getRandomProxy(this.proxies), this.onSuccess);
  }
}

export { loadStaticPage as loadPage };
export default StaticPageLoader;
