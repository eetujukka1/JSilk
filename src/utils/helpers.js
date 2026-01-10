import { URL } from "url";
import Page from "../page";
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
  console.log(
    `Scraped ${page.url} at ${page.lastLoaded} - status code ${page.status}`,
    page,
  );
}

function getPage(page) {
  if (typeof page === "string") {
    const url = normalizeUrl(page);
    page = new Page(url);
  }

  return page;
}

function scoreHtmlForRendering(html) {
  const result = {
    score: 0,
    signals: {}
  };


  /* ---------- Helpers ---------- */

  function addSignal(name, points, triggered) {
    if (triggered) {
      result.score += points;
      result.signals[name] = points;
    } else {
      result.signals[name] = 0;
    }
  }

  function stripTags(str) {
    return str
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* ---------- Signal 1: Low visible text ---------- */

  const visibleText = stripTags(html);
  const textLength = visibleText.length;

  addSignal(
    "lowTextContent",
    3,
    textLength < 500
  );

  /* ---------- Signal 2: SPA root containers ---------- */

  const spaRootPattern = /<div[^>]+id=["']?(app|root|__next|__nuxt)["']?/i;
  addSignal(
    "spaRootContainer",
    4,
    spaRootPattern.test(html)
  );

  /* ---------- Signal 3: Framework markers ---------- */

  const frameworkPattern =
    /data-reactroot|__react|__vue__|ng-version|angular|vue|next\/static|nuxt/i;

  addSignal(
    "frameworkDetected",
    4,
    frameworkPattern.test(html)
  );

  /* ---------- Signal 4: Script dominance ---------- */

  const scriptTags = (html.match(/<script\b/gi) || []).length;
  const scriptRatio = scriptTags > 0 ? scriptTags / Math.max(textLength, 1) : 0;

  addSignal(
    "scriptHeavy",
    2,
    scriptTags >= 10 || scriptRatio > 0.02
  );

  /* ---------- Signal 5: XHR / fetch indicators ---------- */

  const xhrPattern =
    /\b(fetch|xmlhttprequest|axios|graphql|urql|relay)\b/i;

  addSignal(
    "dynamicDataFetch",
    2,
    xhrPattern.test(html)
  );

  /* ---------- Signal 6: Navigation ambiguity ---------- */

  const anchorCount = (html.match(/<a\b[^>]*href=/gi) || []).length;
  const routerLinkPattern =
    /\bonclick=|router-link|data-router|history\.push|navigate\(/i;

  addSignal(
    "jsOnlyNavigation",
    2,
    anchorCount === 0 && routerLinkPattern.test(html)
  );

  /* ---------- Signal 7: Metadata-only content ---------- */

  const hasMeta = /<meta\b|<title>/i.test(html);
  addSignal(
    "metadataOnly",
    2,
    hasMeta && textLength < 300
  );

  return {
    score: result.score,
    textLength,
    signals: result.signals,
    escalate: result.score >= 7
  };
}

export { normalizeUrl, logPage, getPage, scoreHtmlForRendering };
