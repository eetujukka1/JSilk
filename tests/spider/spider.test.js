import { describe, it, expect, jest } from "@jest/globals";
import JSilk from "../../src/index.js";

const { Spider, Page, StaticPageLoader, DynamicPageLoader, DefaultPageLoader } = JSilk;

describe("Spider", () => {
  it("processes queued pages", async () => {
    const spider = new Spider();
    const loadPage = jest.fn(async (page) => page);
    spider.pageloader = { loadPage };

    spider.addToQueue(["https://example.com/a", "https://example.com/b"]);

    await spider.start();

    expect(loadPage).toHaveBeenCalledTimes(2);
    expect(loadPage).toHaveBeenNthCalledWith(1, "https://example.com/a");
    expect(loadPage).toHaveBeenNthCalledWith(2, "https://example.com/b");
    expect(spider.queue.length).toBe(0);
    expect(spider.running).toBe(false);
  });

  it("processes queued Page objects", async () => {
    const spider = new Spider();
    const loadPage = jest.fn(async (page) => page);
    spider.pageloader = { loadPage };

    const pageA = new Page("https://example.com/a");
    const pageB = new Page("https://example.com/b");

    spider.addToQueue([pageA, pageB]);

    await spider.start();

    expect(loadPage).toHaveBeenCalledTimes(2);
    expect(loadPage).toHaveBeenNthCalledWith(1, pageA);
    expect(loadPage).toHaveBeenNthCalledWith(2, pageB);
    expect(spider.queue.length).toBe(0);
    expect(spider.running).toBe(false);
  });

  it("processes a mix of url strings and Page objects", async () => {
    const spider = new Spider();
    const loadPage = jest.fn(async (page) => page);
    spider.pageloader = { loadPage };

    const pageB = new Page("https://example.com/b");

    spider.addToQueue(["https://example.com/a", pageB]);

    await spider.start();

    expect(loadPage).toHaveBeenCalledTimes(2);
    expect(loadPage).toHaveBeenNthCalledWith(1, "https://example.com/a");
    expect(loadPage).toHaveBeenNthCalledWith(2, pageB);
    expect(spider.queue.length).toBe(0);
    expect(spider.running).toBe(false);
  });

  it("stops processing when stop is called", async () => {
    const spider = new Spider();
    let resolveFirst;
    const loadPage = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
    );
    spider.pageloader = { loadPage };

    spider.addToQueue(["https://example.com/a", "https://example.com/b"]);

    const startPromise = spider.start();

    await Promise.resolve();
    expect(loadPage).toHaveBeenCalledTimes(1);

    spider.stop();
    resolveFirst();

    await startPromise;

    expect(loadPage).toHaveBeenCalledTimes(1);
    expect(spider.queue.length).toBe(1);
    expect(spider.running).toBe(false);
  });

  it("creates DefaultPageLoader instance when dynamic is undefined (default)", () => {
    const spider = new Spider();
    expect(spider.pageloader).toBeInstanceOf(DefaultPageLoader);
  });

  it("creates DefaultPageLoader instance when dynamic is explicitly undefined", () => {
    const spider = new Spider([], undefined, undefined);
    expect(spider.pageloader).toBeInstanceOf(DefaultPageLoader);
  });

  it("creates StaticPageLoader instance when dynamic is false", () => {
    const spider = new Spider([], undefined, false);
    expect(spider.pageloader).toBeInstanceOf(StaticPageLoader);
  });

  it("creates DynamicPageLoader instance when dynamic is true", () => {
    const spider = new Spider([], undefined, true);
    expect(spider.pageloader).toBeInstanceOf(DynamicPageLoader);
  });

  it("processes queued pages with DefaultPageLoader", async () => {
    const spider = new Spider();
    const loadPage = jest.fn(async (page) => page);
    spider.pageloader = { loadPage };

    spider.addToQueue(["https://example.com/a", "https://example.com/b"]);

    await spider.start();

    expect(loadPage).toHaveBeenCalledTimes(2);
    expect(loadPage).toHaveBeenNthCalledWith(1, "https://example.com/a");
    expect(loadPage).toHaveBeenNthCalledWith(2, "https://example.com/b");
    expect(spider.queue.length).toBe(0);
    expect(spider.running).toBe(false);
  });

  it("processes queued Page objects with DefaultPageLoader", async () => {
    const spider = new Spider();
    const loadPage = jest.fn(async (page) => page);
    spider.pageloader = { loadPage };

    const pageA = new Page("https://example.com/a");
    const pageB = new Page("https://example.com/b");

    spider.addToQueue([pageA, pageB]);

    await spider.start();

    expect(loadPage).toHaveBeenCalledTimes(2);
    expect(loadPage).toHaveBeenNthCalledWith(1, pageA);
    expect(loadPage).toHaveBeenNthCalledWith(2, pageB);
    expect(spider.queue.length).toBe(0);
    expect(spider.running).toBe(false);
  });

  it("creates DefaultPageLoader with custom proxies and onSuccess callback", () => {
    const mockOnSuccess = jest.fn();
    const spider = new Spider([], mockOnSuccess);
    
    expect(spider.pageloader).toBeInstanceOf(DefaultPageLoader);
    expect(spider.pageloader.proxies).toEqual([]);
    expect(spider.pageloader.onSuccess).toBe(mockOnSuccess);
  });
});
