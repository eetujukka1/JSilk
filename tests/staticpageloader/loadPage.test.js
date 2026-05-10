import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockAxiosGet = jest.fn();

jest.unstable_mockModule("axios", () => ({
  default: {
    get: mockAxiosGet,
  },
}));

const { loadPage } = await import("../../src/staticpageloader/loadPage.js");
const { default: Page } = await import("../../src/page/index.js");

describe("staticpageloader/loadPage", () => {
  beforeEach(() => {
    mockAxiosGet.mockReset();
  });

  it("loads a URL string into a Page and calls onSuccess", async () => {
    const onSuccess = jest.fn();
    mockAxiosGet.mockResolvedValue({
      data: "<html>static</html>",
      status: 200,
    });

    const page = await loadPage("https://example.com", undefined, onSuccess);

    expect(mockAxiosGet).toHaveBeenCalledWith("https://example.com/", {});
    expect(page).toBeInstanceOf(Page);
    expect(page.url).toBe("https://example.com/");
    expect(page.content).toBe("<html>static</html>");
    expect(page.status).toBe(200);
    expect(page.lastLoaded).toBeInstanceOf(Date);
    expect(onSuccess).toHaveBeenCalledWith(page);
  });

  it("passes proxy settings through to axios", async () => {
    const page = new Page("https://example.com");
    const proxy = {
      host: "proxy.example",
      port: 8080,
      username: "user",
      password: "pass",
    };

    mockAxiosGet.mockResolvedValue({
      data: "<html>proxied</html>",
      status: 200,
    });

    const result = await loadPage(page, proxy);

    expect(result).toBe(page);
    expect(mockAxiosGet).toHaveBeenCalledWith("https://example.com/", {
      proxy: {
        host: "proxy.example",
        port: 8080,
        protocol: "http",
        auth: {
          username: "user",
          password: "pass",
        },
      },
    });
  });

  it("wraps request errors with the page URL", async () => {
    mockAxiosGet.mockRejectedValue(new Error("network down"));

    await expect(loadPage("https://example.com")).rejects.toThrow(
      "Failed to load page https://example.com/ - network down",
    );
  });
});
