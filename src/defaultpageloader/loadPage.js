import { getPage, logPage, scoreHtml } from "../utils/helpers.js";
import { loadPage as loadDynamicPage } from "../dynamicpageloader/loadPage.js";
import { loadPage as loadStaticPage } from "../staticpageloader/loadPage.js";

async function loadPage(page, proxy = undefined, onSuccess = logPage) {
  page = getPage(page);

  try {
    page = await loadStaticPage(page, proxy);

    if (typeof page.content !== "object") {
      const { escalate } = scoreHtml(page.content);

      if (escalate) {
        page = await loadDynamicPage(page, proxy);
      }
    }

    if (typeof onSuccess !== "undefined") {
      onSuccess(page);
    }
    return page;
  } catch (error) {
    throw new Error(`Failed to load page ${page.url} - ${error.message}`);
  }
}

export { loadPage };
