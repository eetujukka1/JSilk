import axios from "axios";
import { getPage } from "../utils/helpers.js";

function getAxiosConfig(proxy) {
  if (!proxy) {
    return {};
  }

  return {
    proxy: {
      host: proxy.host,
      port: proxy.port,
      protocol: "http",
      auth: {
        username: proxy.username,
        password: proxy.password,
      },
    },
  };
}

async function loadPage(page, proxy = undefined, onSuccess = undefined) {
  page = getPage(page);

  try {
    const response = await axios.get(page.url, getAxiosConfig(proxy));
    page.content = response.data;
    page.lastLoaded = new Date();
    page.status = response.status;

    if (typeof onSuccess !== "undefined") {
      onSuccess(page);
    }

    return page;
  } catch (error) {
    throw new Error(`Failed to load page ${page.url} - ${error.message}`);
  }
}

export { loadPage };
