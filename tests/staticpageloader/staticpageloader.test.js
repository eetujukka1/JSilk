import { describe, it, expect } from "@jest/globals";
import JSilk from "../../src/index.js";
const { StaticPageLoader, Proxy, Page } = JSilk;
import process from "process";
import dotenv from "dotenv";

dotenv.config();

let ip = null;

describe("StaticPageLoader", () => {
  it("should load a page", async () => {
    const pageLoader = new StaticPageLoader();
    const page = await pageLoader.loadPage("https://ip.oxylabs.io/location");
    ip = page.content.ip;
    expect(page.url).toBe("https://ip.oxylabs.io/location");
  });

  it("should load a page with a proxy", async () => {
    const proxy = new Proxy(process.env.TESTING_PROXY);
    const pageLoader = new StaticPageLoader([proxy]);
    const page = await pageLoader.loadPage("https://ip.oxylabs.io/location");
    expect(page.url).toBe("https://ip.oxylabs.io/location");
    expect(page.content.ip).not.toBe(ip);
  }, 30000);

  it("should fail on faulty url", async () => {
    const pageLoader = new StaticPageLoader();
    await expect(
      pageLoader.loadPage("https://www.google.com/404"),
    ).rejects.toThrow("Failed to load page");
  });

  it("should load a page using a Page object", async () => {
    const pageLoader = new StaticPageLoader();
    const pageObj = new Page("https://ip.oxylabs.io/location");
    const page = await pageLoader.loadPage(pageObj);
    expect(page.url).toBe("https://ip.oxylabs.io/location");
    expect(page.content).toBeDefined();
    expect(page.content.ip).toBeDefined();
  });
});
