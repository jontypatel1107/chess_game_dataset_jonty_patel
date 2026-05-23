const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = `[${timestamp}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`;

    if (process.env.NODE_ENV === "development") {
      console.log(log);
    }
  });

  next();
};

module.exports = requestLogger;
