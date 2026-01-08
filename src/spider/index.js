import PageLoader from "../pageloader";
import { logPage } from "../utils/helpers";

/**
 * Spider - Core web scraping spider class
 * @returns {Spider} Spider object for loading pages
 */
class Spider {
  constructor(proxies = [], onSuccess = logPage) {
    this.pageloader = new PageLoader(proxies, onSuccess);
    this.queue = [];
    this.proxies = proxies;
    this.running = false;
  }

  addToQueue(newPages) {
    this.queue = this.queue.concat(newPages);
  }

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

  async stop() {
    this.running = false;
  }
}

export default Spider;
