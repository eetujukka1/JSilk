/**
 * JSilk - Web Scraping Library
 * Main entry point for the library
 */

import DefaultPageLoader, {
  loadPage as loadDefaultPage,
} from "./defaultpageloader/index.js";
import DynamicPageLoader, {
  loadPage as loadDynamicPage,
} from "./dynamicpageloader/index.js";
import Page from "./page/index.js";
import Proxy from "./proxy/index.js";
import Spider from "./spider/index.js";
import StaticPageLoader, {
  loadPage as loadStaticPage,
} from "./staticpageloader/index.js";

export {
  DefaultPageLoader,
  DynamicPageLoader,
  Spider,
  StaticPageLoader,
  Proxy,
  Page,
  loadDefaultPage,
  loadDynamicPage,
  loadStaticPage,
};

export default {
  DefaultPageLoader,
  DynamicPageLoader,
  Spider,
  StaticPageLoader,
  Proxy,
  Page,
  loadDefaultPage,
  loadDynamicPage,
  loadStaticPage,
};
