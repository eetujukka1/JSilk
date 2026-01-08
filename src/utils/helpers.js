import { URL } from "url";

/**
 * Normalize a URL to ensure it's absolute
 * @param {string} url - URL to normalize
 * @returns {string} Normalized URL
 */
function normalizeUrl(url) {
  try {
    return new URL(url).toString();
  } catch (error) {
    throw new Error(`Invalid URL: ${url} - ${error.message}`);
  }
}

function logPage(page) {
  console.log(`Page: ${page.url} Content:`);
  console.log(page.content);
}

export { normalizeUrl, logPage };
