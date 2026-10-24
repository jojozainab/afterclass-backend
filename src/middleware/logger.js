function logger(req, res, next) {
  const started = Date.now();
  const timestamp = new Date().toISOString();
  // JSON encoding keeps unusual URL characters on a single log line.
  const request = `${req.method} ${JSON.stringify(req.originalUrl)}`;
  console.log(`[${timestamp}] Incoming ${request}`);
  res.on('finish', () => {
    console.log(`[${timestamp}] Completed ${request} ${res.statusCode} ${Date.now() - started}ms`);
  });
  next();
}

module.exports = logger;
