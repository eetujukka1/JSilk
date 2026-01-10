import { describe, it, expect, jest } from "@jest/globals";
import DefaultPageLoader from "../../src/defaultpageloader/index.js";
import StaticPageLoader from "../../src/staticpageloader/index.js";
import DynamicPageLoader from "../../src/dynamicpageloader/index.js";
import { scoreHtml } from "../../src/utils/helpers.js";
import JSilk from "../../src/index.js";
const { Proxy, Page } = JSilk;

describe("DefaultPageLoader", () => {
  describe("constructor", () => {
    it("should initialize with default parameters", () => {
      const loader = new DefaultPageLoader();

      expect(loader.proxies).toEqual([]);
      expect(loader.onSuccess).toBeDefined();
      expect(loader.staticLoader).toBeInstanceOf(StaticPageLoader);
      expect(loader.dynamicLoader).toBeInstanceOf(DynamicPageLoader);
    });

    it("should initialize with custom proxies and onSuccess callback", () => {
      const mockOnSuccess = jest.fn();
      const proxies = [
        new Proxy("http://proxy1:8080"),
        new Proxy("http://proxy2:8080"),
      ];
      const loader = new DefaultPageLoader(proxies, mockOnSuccess);

      expect(loader.proxies).toEqual(proxies);
      expect(loader.onSuccess).toBe(mockOnSuccess);
      expect(loader.staticLoader).toBeInstanceOf(StaticPageLoader);
      expect(loader.staticLoader.proxies).toEqual(proxies);
      expect(loader.dynamicLoader).toBeInstanceOf(DynamicPageLoader);
      expect(loader.dynamicLoader.proxies).toEqual(proxies);
    });

    it("should create instances of StaticPageLoader and DynamicPageLoader", () => {
      const loader = new DefaultPageLoader();

      expect(loader.staticLoader).toBeInstanceOf(StaticPageLoader);
      expect(loader.dynamicLoader).toBeInstanceOf(DynamicPageLoader);
    });
  });

  describe("loadPage", () => {
    it("should load a page using static loader only when escalation is not needed", async () => {
      const loader = new DefaultPageLoader();
      const spyStaticLoad = jest.spyOn(loader.staticLoader, "loadPage");
      const spyDynamicLoad = jest.spyOn(loader.dynamicLoader, "loadPage");

      // Use a simple page that won't trigger escalation
      const page = await loader.loadPage("https://ip.oxylabs.io/location");

      expect(spyStaticLoad).toHaveBeenCalledTimes(1);
      expect(spyDynamicLoad).not.toHaveBeenCalled();
      expect(page.url).toBe("https://ip.oxylabs.io/location");
      expect(page.content).toBeDefined();

      spyStaticLoad.mockRestore();
      spyDynamicLoad.mockRestore();
    }, 30000);

    it("should escalate to dynamic loader when scoreHtml indicates escalation is needed", async () => {
      const loader = new DefaultPageLoader();
      const spyStaticLoad = jest.spyOn(loader.staticLoader, "loadPage");
      const spyDynamicLoad = jest.spyOn(loader.dynamicLoader, "loadPage");

      // First, load a simple page statically to get the base page
      const staticPage = await loader.staticLoader.loadPage(
        "https://ip.oxylabs.io/location",
      );

      // Manually create a page with HTML that will trigger escalation
      const highScoreHtml =
        "<div id='app'></div><div id='root'></div><script>__REACT__</script><script>React.render()</script>";
      staticPage.content = highScoreHtml;

      const { escalate } = scoreHtml(highScoreHtml);
      expect(escalate).toBe(true); // Verify this HTML triggers escalation

      // Now test that DefaultPageLoader escalates
      // We need to spy on the actual loadPage to intercept
      const originalLoadPage = loader.staticLoader.loadPage.bind(
        loader.staticLoader,
      );
      loader.staticLoader.loadPage = jest.fn().mockResolvedValue(staticPage);

      await loader.loadPage(staticPage);

      expect(loader.staticLoader.loadPage).toHaveBeenCalledWith(staticPage);
      expect(spyDynamicLoad).toHaveBeenCalled();

      // Restore
      loader.staticLoader.loadPage = originalLoadPage;
      spyStaticLoad.mockRestore();
      spyDynamicLoad.mockRestore();
    }, 60000);

    it("should accept a URL string and convert it to a Page object", async () => {
      const loader = new DefaultPageLoader();
      const url = "https://ip.oxylabs.io/location";

      const page = await loader.loadPage(url);

      expect(page.url).toBe(url);
      expect(page.content).toBeDefined();
      expect(page.status).toBeDefined();
    }, 30000);

    it("should accept a Page object", async () => {
      const loader = new DefaultPageLoader();
      const pageObj = new Page("https://ip.oxylabs.io/location");

      const page = await loader.loadPage(pageObj);

      expect(page.url).toBe("https://ip.oxylabs.io/location");
      expect(page.content).toBeDefined();
    }, 30000);

    it("should not escalate when HTML score is below threshold", async () => {
      const loader = new DefaultPageLoader();
      const spyStaticLoad = jest.spyOn(loader.staticLoader, "loadPage");
      const spyDynamicLoad = jest.spyOn(loader.dynamicLoader, "loadPage");

      // Create a page with HTML that won't trigger escalation
      const lowScoreHtml =
        "<html><head><title>Test</title></head><body><p>This is a simple page with enough text content to avoid triggering escalation signals. It contains plain HTML without any JavaScript frameworks, SPA root containers, or other indicators that would require dynamic loading. The content is substantial enough to pass the text length check.</p></body></html>";

      // Mock the static loader to return our low-score HTML
      const mockPage = new Page("https://example.com");
      const originalLoadPage = loader.staticLoader.loadPage.bind(
        loader.staticLoader,
      );
      loader.staticLoader.loadPage = jest.fn().mockResolvedValue({
        ...mockPage,
        content: lowScoreHtml,
        status: 200,
        lastLoaded: new Date(),
      });

      const result = await loader.loadPage(mockPage);
      const { escalate } = scoreHtml(lowScoreHtml);

      expect(escalate).toBe(false);
      expect(loader.staticLoader.loadPage).toHaveBeenCalled();
      expect(spyDynamicLoad).not.toHaveBeenCalled();
      expect(result.content).toBe(lowScoreHtml);

      // Restore
      loader.staticLoader.loadPage = originalLoadPage;
      spyStaticLoad.mockRestore();
      spyDynamicLoad.mockRestore();
    });

    it("should handle errors from static loader", async () => {
      const loader = new DefaultPageLoader();
      const spyStaticLoad = jest.spyOn(loader.staticLoader, "loadPage");
      const spyDynamicLoad = jest.spyOn(loader.dynamicLoader, "loadPage");

      spyStaticLoad.mockRejectedValue(new Error("Failed to load page"));

      await expect(
        loader.loadPage("https://invalid-url-that-does-not-exist-12345.com"),
      ).rejects.toThrow();
      expect(spyDynamicLoad).not.toHaveBeenCalled();

      spyStaticLoad.mockRestore();
      spyDynamicLoad.mockRestore();
    });

    it("should handle errors from dynamic loader when escalation is triggered", async () => {
      const loader = new DefaultPageLoader();
      const spyStaticLoad = jest.spyOn(loader.staticLoader, "loadPage");
      const spyDynamicLoad = jest.spyOn(loader.dynamicLoader, "loadPage");

      // Create a page with HTML that triggers escalation
      const highScoreHtml = "<div id='app'></div><script>__REACT__</script>";
      const mockPage = new Page("https://example.com");
      const staticPageResult = {
        ...mockPage,
        content: highScoreHtml,
        status: 200,
        lastLoaded: new Date(),
      };

      const originalStaticLoad = loader.staticLoader.loadPage.bind(
        loader.staticLoader,
      );
      loader.staticLoader.loadPage = jest
        .fn()
        .mockResolvedValue(staticPageResult);
      spyDynamicLoad.mockRejectedValue(
        new Error("Failed to load page dynamically"),
      );

      await expect(loader.loadPage(mockPage)).rejects.toThrow(
        "Failed to load page dynamically",
      );

      expect(loader.staticLoader.loadPage).toHaveBeenCalled();
      expect(spyDynamicLoad).toHaveBeenCalled();

      // Restore
      loader.staticLoader.loadPage = originalStaticLoad;
      spyStaticLoad.mockRestore();
      spyDynamicLoad.mockRestore();
    });
  });
});
