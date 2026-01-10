import StaticPageLoader from "../staticpageloader";
import DynamicPageLoader from "../dynamicpageloader";
import { logPage, scoreHtml } from "../utils/helpers";

/**
 * DefaultPageLoader - A smart page loader that attempts static loading first,
 * then escalates to dynamic loading (JavaScript rendering) if the HTML content
 * indicates it may be required (e.g., SPA frameworks, low text content, etc.)
 * @param {Array} proxies - Array of proxy objects to use for requests
 * @param {Function} onSuccess - Callback function called after successful page load (default: logPage)
 */
class DefaultPageLoader {
  /**
   * Creates a new DefaultPageLoader instance
   * @param {Array} proxies - Array of proxy objects to use for requests
   * @param {Function} onSuccess - Callback function called after successful page load (default: logPage)
   */
  constructor(proxies = [], onSuccess = logPage) {
    this.proxies = proxies;
    this.onSuccess = onSuccess;
    this.staticLoader = new StaticPageLoader(proxies)
    this.dynamicLoader = new DynamicPageLoader(proxies)
  }

  /**
   * Loads a page using static loading first, then escalates to dynamic loading
   * if the HTML score indicates JavaScript rendering may be required
   * @param {Page|string} page - Page object or URL string to load
   * @returns {Promise<Page>} Promise resolving to the Page object with content, status, and lastLoaded timestamp
   * @throws {Error} Throws an error if page loading fails
   */
  async loadPage(page) {
    try {
      page = await this.staticLoader.loadPage(page)
    
      if (typeof page.content != "object")
      {
        const { escalate } = scoreHtml(page.content);
  
        if (escalate) {
          page = await this.dynamicLoader.loadPage(page)
        }
      }
      this.onSuccess(page)
      return page;
    } catch (error) {
      throw new Error(`Failed to load page ${page.url} - ${error.message}`);
    }
  }
}

export default DefaultPageLoader;