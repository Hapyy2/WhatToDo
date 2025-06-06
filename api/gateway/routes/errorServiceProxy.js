const { createProxyMiddleware } = require("http-proxy-middleware");

const errorServiceProxy = (errorServiceUrl) => {
  if (!errorServiceUrl) {
    throw new Error(
      "ERROR_SERVICE_INTERNAL_URL is not defined in .env for API Gateway"
    );
  }

  return createProxyMiddleware({
    target: errorServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      "^/gw/errors": "/api/errors",
    },
    timeout: 60000,
    proxyTimeout: 300000,
    logLevel: "debug",
    logProvider: () => console,
    onProxyReq: (proxyReq, req, res) => {
      if (req.auth && req.auth.sub) {
        proxyReq.setHeader("X-User-ID", req.auth.sub);
        if (req.auth.realm_access && req.auth.realm_access.roles) {
          proxyReq.setHeader(
            "X-User-Roles",
            req.auth.realm_access.roles.join(",")
          );
        }
      }
      console.log(
        `[HPM errors] Proxying request from ${req.originalUrl} to ${errorServiceUrl}${proxyReq.path}`
      );
    },
    onError: (err, req, res, target) => {
      console.error(
        `[HPM errors] Proxying to ${
          target ? target.href : "error-service"
        } failed:`,
        err
      );
      if (res.headersSent) {
        return;
      }
      if (res && typeof res.status === "function") {
        res.status(503).json({
          message: "Error connecting to the Error Service.",
          proxyError: err.message,
        });
      } else {
        console.error(
          "[HPM errors onError] Cannot send error response, res is not valid."
        );
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(
        `[HPM errors onProxyRes] For ${req.method} ${req.originalUrl}, received response from error-service: ${proxyRes.statusCode}`
      );
    },
  });
};

module.exports = errorServiceProxy;
