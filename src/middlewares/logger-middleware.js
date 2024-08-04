const requestLoggerMiddleware = (req, res, next) => {
    const now = new Date();
    const requestLogMessage = `[METHOD]: ${req.method} [URL]: ${req.url} [INVOCATION-DATE]: ${now.toLocaleDateString()} - ${now.toLocaleTimeString()}`;
    console.log(requestLogMessage);
    return next();
};

/*
server response: URL, method, total time of processing the request, response HTTP code
const responseLoggerMiddleware = (req, res, next) => {
    const now = new Date().toLocaleDateString();
    const logMessage = `${now}: ${req.method} ${
        req.url
    } - body params ${JSON.stringify(req.body)}`;
    console.log(logMessage);
    return next();
}; */

module.exports = { requestLoggerMiddleware };
