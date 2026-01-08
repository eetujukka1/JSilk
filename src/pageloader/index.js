import axios from "axios";
import Page from "../page";
import { normalizeUrl } from "../utils/helpers";
import { logPage } from "../utils/helpers";

/**
 * PageLoader - Loads pages from the web
 * @param {Array} proxies - Array of proxy objects
 * @returns {Promise<Page>} Promise resolving to the Page object
 */
class PageLoader {
  constructor(proxies = [], onSuccess = logPage) {
    this.proxies = proxies;
    this.onSuccess = onSuccess;
  }

  async loadPage(page) {
    let url;
    if (typeof page === "string") {
      url = normalizeUrl(page);
      page = new Page(url);
    } else {
      url = page.url;
    }

    const config = {};

    if (this.proxies && this.proxies.length > 0) {
      const proxy =
        this.proxies[Math.floor(Math.random() * this.proxies.length)];
      config.proxy = {
        host: proxy.host,
        port: proxy.port,
        protocol: "http",
        auth: {
          username: proxy.username,
          password: proxy.password,
        },
      };
    }

    try {
      const response = await axios.get(url, config);
      page.content = response.data;
      page.lastLoaded = new Date();
      page.status = response.status;
      this.onSuccess(page);
      return page;
    } catch (error) {
      throw new Error(`Failed to load page ${url} - ${error.message}`);
    }
  }
}

export default PageLoader;
