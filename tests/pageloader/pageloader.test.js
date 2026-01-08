import { describe, it, expect } from "@jest/globals";
import JSilk from "../../src/index.js";
const { PageLoader, Proxy } = JSilk;
import process from "process";
import dotenv from "dotenv";

dotenv.config();

let ip = null;

describe("PageLoader", () => {
  it("should load a page", async () => {
    const pageLoader = new PageLoader();
    const page = await pageLoader.loadPage(
      "https://ip.oxylabs.io/location",
    );
    ip = page.content.ip;
    expect(page.url).toBe("https://ip.oxylabs.io/location");
  });

  it("should load a page with a proxy", async () => {
    const proxy = new Proxy(process.env.TESTING_PROXY);
    const pageLoader = new PageLoader([proxy]);
    const page = await pageLoader.loadPage(
      "https://ip.oxylabs.io/location",
    );
    expect(page.url).toBe("https://ip.oxylabs.io/location");
    expect(page.content.ip).not.toBe(ip);
  }, 30000);
  it("should fail on faulty url", async () => {
    const pageLoader = new PageLoader()
    await expect(
      pageLoader.loadPage("https://www.google.com/404")
    ).rejects.toThrow("Failed to load page")
  })
});
