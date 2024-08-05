const { router: usersRouter } = require('./users');
const { router: productsRouter } = require('./products');
const { requestLoggerMiddleware } = require('../middlewares/logger-middleware');
const { errorHandlerMiddleware } = require('../middlewares/errors-handler-middleware');
/* import { loggerMiddleware } from '../middlewares/logger.middleware.js'; */

const initRoutes = (app) => {
    app.use(requestLoggerMiddleware);
    app.use('/users', usersRouter);
    app.all('*', productsRouter);
    app.use(errorHandlerMiddleware);
    /* app.use(responseMiddleware); */
};

module.exports = { initRoutes };
