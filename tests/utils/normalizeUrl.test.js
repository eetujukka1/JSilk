import { describe, it, expect } from "@jest/globals";
import { normalizeUrl } from "../../src/utils/helpers";

describe("normalizeUrl", () => {
  it("should normalize a URL", () => {
    expect(normalizeUrl("https://www.google.com")).toBe(
      "https://www.google.com/",
    );
  });
  it("should normalize a URL with a path", () => {
    expect(normalizeUrl("https://www.google.com/search?q=test")).toBe(
      "https://www.google.com/search?q=test",
    );
  });
  it("should normalize a URL with a query", () => {
    expect(normalizeUrl("https://www.google.com/search?q=test&page=1")).toBe(
      "https://www.google.com/search?q=test&page=1",
    );
  });
  it("should normalize a URL with a fragment", () => {
    expect(normalizeUrl("https://www.google.com/search?q=test#fragment")).toBe(
      "https://www.google.com/search?q=test#fragment",
    );
  });
  it("should throw an error for a URL without a protocol", () => {
    expect(() => normalizeUrl("www.google.com")).toThrow("Invalid URL");
  });
  it("should throw an error for a URL without a protocol and www", () => {
    expect(() => normalizeUrl("google.com")).toThrow("Invalid URL");
  });
  it("should throw an error for a relative URL", () => {
    expect(() => normalizeUrl("/path/to/page")).toThrow("Invalid URL");
  });
  it("should throw an error for a URL with only a path", () => {
    expect(() => normalizeUrl("search?q=test")).toThrow("Invalid URL");
  });
});
