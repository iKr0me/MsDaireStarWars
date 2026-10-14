import { Readable } from 'node:stream';

// Run the same Web handlers locally as Vercel, without another service or CLI.
export function localNotesApi() {
  return {
    name: 'local-notes-api',
    configureServer(server) {
      server.middlewares.use(async (incoming, outgoing, next) => {
        const url = new URL(incoming.url, `http://${incoming.headers.host || '127.0.0.1'}`);
        if (!url.pathname.startsWith('/api/')) return next();
        try {
          const routes = {
            '/api/notes': () => import('./api/notes.js'),
            '/api/photo': () => import('./api/photo.js'),
          };
          if (!routes[url.pathname]) { outgoing.writeHead(404);outgoing.end();return; }
          const module = await routes[url.pathname]();
          const handler = module[incoming.method];
          if (!handler) { outgoing.writeHead(405, {Allow: Object.keys(module).filter(key => /^[A-Z]+$/.test(key)).join(', ')});outgoing.end();return; }
          const headers = new Headers();
          for (const [key, value] of Object.entries(incoming.headers)) {
            if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
          }
          const options = { method: incoming.method, headers };
          if (!['GET', 'HEAD'].includes(incoming.method)) {
            options.body = Readable.toWeb(incoming);options.duplex = 'half';
          }
          const response = await handler(new Request(url, options));
          outgoing.statusCode = response.status;
          response.headers.forEach((value, key) => { if (key !== 'set-cookie') outgoing.setHeader(key, value); });
          const cookies = response.headers.getSetCookie();
          if (cookies.length) outgoing.setHeader('set-cookie', cookies);
          outgoing.end(Buffer.from(await response.arrayBuffer()));
        } catch {
          console.error('Local note API failed.');
          outgoing.writeHead(503, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
          outgoing.end(JSON.stringify({error: 'The note service is unavailable. Check the local setup.',code: 'SERVICE_UNAVAILABLE'}));
        }
      });
    },
  };
}
