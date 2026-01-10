import StaticPageLoader from "../staticpageloader";
import DefaultPageLoader from "../defaultpageloader";
import DynamicPageLoader from "../dynamicpageloader";
import { logPage } from "../utils/helpers";

/**
 * Spider - Core web scraping spider class
 * @returns {Spider} Spider object for loading pages
 */
class Spider {
  constructor(proxies = [], onSuccess = logPage, dynamic = undefined) {
    this.pageloader =
      typeof dynamic === "undefined"
        ? new DefaultPageLoader(proxies, onSuccess)
        : dynamic
          ? new DynamicPageLoader(proxies, onSuccess)
          : new StaticPageLoader(proxies, onSuccess);
    this.queue = [];
    this.proxies = proxies;
    this.running = false;
  }

  /**
   * Add one or more pages to the crawl queue.
   * @param {string[]|string|Page|Page[]} newPages - A URL or array of URLs to enqueue for crawling.
   */
  addToQueue(newPages) {
    this.queue = this.queue.concat(newPages);
  }

  /**
   * Start processing the crawl queue.
   * Runs until stopped or the queue is empty, loading each queued page with the internal `StaticPageLoader`.
   * Subsequent calls are ignored while a crawl is already running.
   * @returns {Promise<void>}
   */
  async start() {
    if (this.running) return;
    this.running = true;

    while (this.running && this.queue.length > 0) {
      const nextPage = this.queue.shift();
      try {
        await this.pageloader.loadPage(nextPage);
      } catch (error) {
        console.error(error);
      }
    }

    this.running = false;
  }

  /**
   * Stop the spider after the current iteration.
   * This sets the running flag to false so the main loop in `start` can exit cleanly.
   * @returns {Promise<void>}
   */
  async stop() {
    this.running = false;
  }
}

export default Spider;
