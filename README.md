# JSilk

A web scraping library for Node.js with intelligent page loading. JSilk automatically detects whether a page requires JavaScript rendering and chooses the optimal loading strategy — fast HTTP requests for static pages, and headless browser rendering for SPAs.

## Installation

```bash
npm install jsilk
```

For dynamic page loading, Playwright's Chromium browser must also be installed:

```bash
npx playwright install chromium
```

## Quick Start

```javascript
import JSilk from "jsilk";
const { Spider } = JSilk;

const spider = new Spider();
spider.addToQueue(["https://example.com"]);
await spider.start();
```

## Page Loading Strategies

JSilk provides three page loading strategies controlled by the `dynamic` parameter on `Spider`:

| Strategy    | `dynamic` value       | Engine                               | Best for                         |
| ----------- | --------------------- | ------------------------------------ | -------------------------------- |
| **Default** | `undefined` (default) | Static first, then dynamic if needed | Unknown pages                    |
| **Static**  | `false`               | Axios HTTP requests                  | Server-rendered HTML             |
| **Dynamic** | `true`                | Playwright Chromium                  | SPAs (React, Vue, Angular, etc.) |

The **default** strategy loads the page over HTTP first, then analyzes the HTML using a heuristic scoring system. If the content appears to be a JavaScript-heavy SPA (score >= 7), it automatically re-fetches the page with a headless browser.

Heuristic signals include: low visible text content, SPA root containers (`#app`, `#root`, `#__next`), framework markers (React, Vue, Angular), heavy script presence, dynamic data fetching patterns, and JS-only navigation.

## Usage

### Basic Scraping

```javascript
import JSilk from "jsilk";
const { Spider } = JSilk;

const spider = new Spider();
spider.addToQueue(["https://example.com", "https://example.com/about"]);
await spider.start();
```

### Custom Callback

By default, loaded pages are logged to the console. Pass a custom callback to handle pages yourself:

```javascript
const onSuccess = (page) => {
  console.log(page.url); // The page URL
  console.log(page.content); // HTML content
  console.log(page.status); // HTTP status code
  console.log(page.lastLoaded); // Date timestamp
};

const spider = new Spider([], onSuccess);
spider.addToQueue(["https://example.com"]);
await spider.start();
```

### Force Static or Dynamic Loading

```javascript
// Static only (fast, no browser overhead)
const staticSpider = new Spider([], undefined, false);

// Dynamic only (full JS rendering via Chromium)
const dynamicSpider = new Spider([], undefined, true);
```

### Proxy Support

```javascript
import JSilk from "jsilk";
const { Spider, Proxy } = JSilk;

const proxy = new Proxy("host:port:username:password");
const spider = new Spider([proxy]);
spider.addToQueue(["https://example.com"]);
await spider.start();
```

When multiple proxies are provided, one is selected at random for each request.

### Using Page Objects

You can enqueue `Page` objects directly instead of URL strings:

```javascript
import JSilk from "jsilk";
const { Spider, Page } = JSilk;

const page = new Page("https://example.com");
const spider = new Spider();
spider.addToQueue([page]);
await spider.start();
```

### Stopping the Spider

```javascript
const spider = new Spider();
spider.addToQueue(urls);
spider.start(); // don't await — start in background
// ...
await spider.stop(); // stops after the current page finishes
```

## API

### `Spider(proxies?, onSuccess?, dynamic?)`

The main entry point for scraping.

- **`proxies`** `Proxy[]` — Array of proxy objects. Default: `[]`
- **`onSuccess`** `Function` — Callback called with the loaded `Page`. Default: logs to console
- **`dynamic`** `boolean | undefined` — Loading strategy. `undefined` = auto, `false` = static, `true` = dynamic

**Methods:**

- **`addToQueue(pages)`** — Add URL strings, `Page` objects, or an array of either to the queue
- **`start()`** — Process the queue. Returns a `Promise` that resolves when the queue is empty or `stop()` is called
- **`stop()`** — Stop processing after the current page finishes

### `Page(url, content?)`

Represents a web page.

- **`url`** `string` — Absolute URL (automatically normalized)
- **`content`** `string | null` — HTML content (populated after loading)
- **`status`** `number | null` — HTTP status code
- **`lastLoaded`** `Date | null` — Timestamp of last load

### `Proxy(proxy)`

Proxy configuration.

- **`proxy`** `string` — Format: `"host:port:username:password"` (username and password are optional)

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint
npm run lint

# Format code
npm run format

# Check formatting
npm run checkformat
```
