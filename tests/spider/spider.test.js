import { describe, it, expect, jest } from "@jest/globals";
import JSilk from "../../src/index.js";

const { Spider, Page } = JSilk;

describe("Spider", () => {
  it("processes queued pages with PageLoader", async () => {
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

  it("processes queued Page objects with PageLoader", async () => {
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
});
