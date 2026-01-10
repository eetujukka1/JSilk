import { describe, it, expect } from "@jest/globals";
import JSilk from "../../src/index.js";
const { DynamicPageLoader, Proxy, Page } = JSilk;
import process from "process";
import dotenv from "dotenv";

dotenv.config();

let reference = null;

describe("DynamicPageLoader", () => {
  it("should load a page", async () => {
    const pageLoader = new DynamicPageLoader();
    const page = await pageLoader.loadPage("https://ip.oxylabs.io/location");
    expect(page.url).toBe("https://ip.oxylabs.io/location");
    expect(page.content).toBeDefined();
    expect(typeof page.content).toBe("string");
    expect(page.content.length).toBeGreaterThan(0);
    expect(page.status).toBeDefined();
    expect(page.lastLoaded).toBeInstanceOf(Date);

    reference = page.content;
  }, 60000);

  it("should load a page with a proxy", async () => {
    if (!process.env.TESTING_PROXY) {
      console.log("Skipping proxy test - TESTING_PROXY not set");
      return;
    }
    const proxy = new Proxy(process.env.TESTING_PROXY);
    const pageLoader = new DynamicPageLoader([proxy]);
    const page = await pageLoader.loadPage("https://ip.oxylabs.io/location");
    expect(page.url).toBe("https://ip.oxylabs.io/location");
    expect(page.content).toBeDefined();
    expect(typeof page.content).toBe("string");
    expect(page.content.length).toBeGreaterThan(0);

    expect(page.content).not.toBe(reference);
  }, 60000);

  it("should fail on faulty url", async () => {
    const pageLoader = new DynamicPageLoader();
    await expect(
      pageLoader.loadPage(
        "https://invalid-domain-that-does-not-exist-12345.com",
      ),
    ).rejects.toThrow("Failed to load page");
  }, 60000);

  it("should load a page using a Page object", async () => {
    const pageLoader = new DynamicPageLoader();
    const pageObj = new Page("https://ip.oxylabs.io/location");
    const page = await pageLoader.loadPage(pageObj);
    expect(page.url).toBe("https://ip.oxylabs.io/location");
    expect(page.content).toBeDefined();
    expect(typeof page.content).toBe("string");
    expect(page.content.length).toBeGreaterThan(0);
    expect(page.status).toBeDefined();
    expect(page.lastLoaded).toBeInstanceOf(Date);
  }, 60000);
});
