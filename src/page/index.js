/**
 * Page - a web page
 * @param {string} url - url of the web page
 * @param {string} content - content of the web page
 * @returns {Page} Page object
 */
class Page {
  constructor(url, content = null) {
    this.url = url;
    this.content = content;
  }
}

export default Page;
