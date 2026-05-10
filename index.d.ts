export interface ProxySettings {
  host: string;
  port: string | number;
  username?: string | null;
  password?: string | null;
}

export type PageInput = string | Page;
export type PageSuccessHandler = (page: Page) => void;

export class Page<TContent = unknown> {
  url: string;
  content: TContent | null;
  status: number | null;
  lastLoaded: Date | null;

  constructor(url: string, content?: TContent | null);
}

export class Proxy implements ProxySettings {
  host: string;
  port: string;
  username: string | null;
  password: string | null;

  constructor(proxy: string);
}

export class StaticPageLoader {
  proxies: ProxySettings[];
  onSuccess?: PageSuccessHandler | undefined;

  constructor(
    proxies?: ProxySettings[],
    onSuccess?: PageSuccessHandler | undefined,
  );

  loadPage(page: PageInput): Promise<Page>;
}

export class DynamicPageLoader extends StaticPageLoader {
  loadPage(page: PageInput): Promise<Page<string>>;
}

export class DefaultPageLoader {
  proxies: ProxySettings[];
  onSuccess: PageSuccessHandler;
  staticLoader: StaticPageLoader;
  dynamicLoader: DynamicPageLoader;

  constructor(proxies?: ProxySettings[], onSuccess?: PageSuccessHandler);

  loadPage(page: PageInput): Promise<Page>;
}

export class Spider {
  pageloader: DefaultPageLoader | StaticPageLoader | DynamicPageLoader;
  queue: PageInput[];
  proxies: ProxySettings[];
  running: boolean;

  constructor(
    proxies?: ProxySettings[],
    onSuccess?: PageSuccessHandler,
    dynamic?: boolean | undefined,
  );

  addToQueue(newPages: PageInput | PageInput[]): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function loadStaticPage(
  page: PageInput,
  proxy?: ProxySettings,
  onSuccess?: PageSuccessHandler | undefined,
): Promise<Page>;

export function loadDynamicPage(
  page: PageInput,
  proxy?: ProxySettings,
  onSuccess?: PageSuccessHandler | undefined,
): Promise<Page<string>>;

export function loadDefaultPage(
  page: PageInput,
  proxy?: ProxySettings,
  onSuccess?: PageSuccessHandler | undefined,
): Promise<Page>;

declare const JSilk: {
  DefaultPageLoader: typeof DefaultPageLoader;
  DynamicPageLoader: typeof DynamicPageLoader;
  Spider: typeof Spider;
  StaticPageLoader: typeof StaticPageLoader;
  Proxy: typeof Proxy;
  Page: typeof Page;
  loadDefaultPage: typeof loadDefaultPage;
  loadDynamicPage: typeof loadDynamicPage;
  loadStaticPage: typeof loadStaticPage;
};

export default JSilk;
