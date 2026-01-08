import { normalizeUrl } from "../utils/helpers";

/**
 * Page - a web page
 * @param {string} url - url of the web page
 * @param {string} content - content of the web page
 * @returns {Page} Page object
 */
class Page {
  constructor(url, content = null) {
    this.url = normalizeUrl(url);
    this.content = content;
    this.status = null;
    this.lastLoaded = null;
  }
}

export default Page;
