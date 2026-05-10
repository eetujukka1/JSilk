import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockStaticLoadPage = jest.fn();
const mockDynamicLoadPage = jest.fn();

jest.unstable_mockModule("../../src/staticpageloader/loadPage.js", () => ({
  loadPage: mockStaticLoadPage,
}));

jest.unstable_mockModule("../../src/dynamicpageloader/loadPage.js", () => ({
  loadPage: mockDynamicLoadPage,
}));

const { loadPage } = await import("../../src/defaultpageloader/loadPage.js");
const { default: Page } = await import("../../src/page/index.js");

describe("defaultpageloader/loadPage", () => {
  beforeEach(() => {
    mockStaticLoadPage.mockReset();
    mockDynamicLoadPage.mockReset();
  });

  it("loads statically and does not escalate for low-score HTML", async () => {
    const onSuccess = jest.fn();
    const staticPage = {
      url: "https://example.com/",
      content:
        "<html><body><p>This page has enough plain text content to avoid escalation signals and should stay on the static loader path during the test.</p></body></html>",
      status: 200,
      lastLoaded: new Date(),
    };

    mockStaticLoadPage.mockResolvedValue(staticPage);

    const page = await loadPage("https://example.com", undefined, onSuccess);

    expect(mockStaticLoadPage).toHaveBeenCalledTimes(1);
    expect(mockStaticLoadPage.mock.calls[0][0]).toBeInstanceOf(Page);
    expect(mockDynamicLoadPage).not.toHaveBeenCalled();
    expect(page).toBe(staticPage);
    expect(onSuccess).toHaveBeenCalledWith(staticPage);
  });

  it("escalates to the dynamic loader for high-score HTML", async () => {
    const staticPage = {
      url: "https://example.com/",
      content:
        "<div id='app'></div><div id='root'></div><script>__REACT__</script><script>fetch('/api')</script>",
      status: 200,
      lastLoaded: new Date(),
    };
    const dynamicPage = {
      ...staticPage,
      content: "<html><body>Rendered app</body></html>",
      lastLoaded: new Date(),
    };

    mockStaticLoadPage.mockResolvedValue(staticPage);
    mockDynamicLoadPage.mockResolvedValue(dynamicPage);

    const page = await loadPage(new Page("https://example.com"));

    expect(mockStaticLoadPage).toHaveBeenCalledWith(
      expect.objectContaining({ url: "https://example.com/" }),
      undefined,
    );
    expect(mockDynamicLoadPage).toHaveBeenCalledWith(staticPage, undefined);
    expect(page).toBe(dynamicPage);
  });

  it("skips escalation when static content is already an object", async () => {
    const staticPage = {
      url: "https://example.com/",
      content: { structured: true },
      status: 200,
      lastLoaded: new Date(),
    };

    mockStaticLoadPage.mockResolvedValue(staticPage);

    const page = await loadPage("https://example.com");

    expect(mockDynamicLoadPage).not.toHaveBeenCalled();
    expect(page).toBe(staticPage);
  });

  it("wraps static loader errors with the page URL", async () => {
    mockStaticLoadPage.mockRejectedValue(new Error("static failed"));

    await expect(loadPage("https://example.com")).rejects.toThrow(
      "Failed to load page https://example.com/ - static failed",
    );
  });

  it("wraps dynamic loader errors with the page URL", async () => {
    mockStaticLoadPage.mockResolvedValue({
      url: "https://example.com/",
      content:
        "<div id='app'></div><div id='root'></div><script>__REACT__</script><script>fetch('/api')</script>",
      status: 200,
      lastLoaded: new Date(),
    });
    mockDynamicLoadPage.mockRejectedValue(new Error("dynamic failed"));

    await expect(loadPage("https://example.com")).rejects.toThrow(
      "Failed to load page https://example.com/ - dynamic failed",
    );
  });
});
