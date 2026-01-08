/**
 * Proxy - Proxy class
 * @param {string} proxy - Proxy string in the format "host:port:username:password"
 * @returns {Proxy} Proxy object
 */
class Proxy {
  constructor(proxy) {
    const [host, port, username, password] = proxy.split(":");

    this.host = host;
    this.port = port;
    this.username = username || null;
    this.password = password || null;
  }
}

export default Proxy;
