import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockLaunch = jest.fn();

jest.unstable_mockModule("playwright", () => ({
  chromium: {
    launch: mockLaunch,
  },
}));

const { loadPage } = await import("../../src/dynamicpageloader/loadPage.js");
const { default: Page } = await import("../../src/page/index.js");

describe("dynamicpageloader/loadPage", () => {
  beforeEach(() => {
    mockLaunch.mockReset();
  });

  it("loads rendered HTML and calls onSuccess", async () => {
    const onSuccess = jest.fn();
    const close = jest.fn().mockResolvedValue(undefined);
    const goto = jest.fn().mockResolvedValue({
      status: () => 201,
    });
    const content = jest.fn().mockResolvedValue("<html>dynamic</html>");

    mockLaunch.mockResolvedValue({
      newContext: jest.fn().mockResolvedValue({
        newPage: jest.fn().mockResolvedValue({
          goto,
          content,
        }),
      }),
      close,
    });

    const page = await loadPage("https://example.com", undefined, onSuccess);

    expect(mockLaunch).toHaveBeenCalledWith({ headless: true });
    expect(goto).toHaveBeenCalledWith("https://example.com/", {
      waitUntil: "networkidle",
    });
    expect(page).toBeInstanceOf(Page);
    expect(page.content).toBe("<html>dynamic</html>");
    expect(page.status).toBe(201);
    expect(page.lastLoaded).toBeInstanceOf(Date);
    expect(close).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(page);
  });

  it("passes proxy settings through to Playwright", async () => {
    const close = jest.fn().mockResolvedValue(undefined);
    mockLaunch.mockResolvedValue({
      newContext: jest.fn().mockResolvedValue({
        newPage: jest.fn().mockResolvedValue({
          goto: jest.fn().mockResolvedValue({
            status: () => 200,
          }),
          content: jest.fn().mockResolvedValue("<html>proxied</html>"),
        }),
      }),
      close,
    });

    await loadPage("https://example.com", {
      host: "proxy.example",
      port: 8080,
      username: "user",
      password: "pass",
    });

    expect(mockLaunch).toHaveBeenCalledWith({
      headless: true,
      proxy: {
        server: "http://proxy.example:8080",
        username: "user",
        password: "pass",
      },
    });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("closes the browser and wraps errors when rendering fails", async () => {
    const close = jest.fn().mockResolvedValue(undefined);
    mockLaunch.mockResolvedValue({
      newContext: jest.fn().mockResolvedValue({
        newPage: jest.fn().mockResolvedValue({
          goto: jest.fn().mockRejectedValue(new Error("browser crash")),
          content: jest.fn(),
        }),
      }),
      close,
    });

    await expect(loadPage("https://example.com")).rejects.toThrow(
      "Failed to load page https://example.com/ - browser crash",
    );

    expect(close).toHaveBeenCalledTimes(1);
  });
});
