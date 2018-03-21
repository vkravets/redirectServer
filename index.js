const http = require('http');
const { URL } = require('url');

const _request = url => new Promise((resolve, reject) => {
  http.get(url, (res) => {
    res.setEncoding('utf8');
    const { statusCode, headers } = res;

    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    }).on('end', () => {
      resolve({ statusCode, headers, body });
    });
  }).on('error', reject);
});

((options = {
  host: '0.0.0.0',
  port: process.env.PORT || 8080,
  server: '<server-ip>',
}) => {
  console.info('Starting server...');

  const server = http.createServer(async (req, res) => {
    console.info('Redirecting...');

    try {
      const url = new URL(req.url, options.server).toString();
      const { statusCode, headers, body } = await _request(url);

      res.writeHead(statusCode, headers);
      res.write(body);
      res.end();

      console.info('Ok');
    } catch (err) {
      console.error('Request error', err);

      res.writeHead(500, err.message);
      res.write(err.message);
      res.end();
    }
  }).listen(options.port, options.host);

  const stop = () => {
    console.info('Stopping server...');
    server.close(() => process.exit(0));

    setTimeout(() => {
      process.exit(0);
    }, 5000); // Force exit
  };

  server.on('listening', () => {
    console.info(`Redirecting requests to ${options.server}`);
    console.info(`Listening on http://${options.host}:${options.port} <- Use this url for accessing on local machine`);
  });

  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
})();
