const { router: usersRouter } = require('./users');
const { router: productsRouter, productRoutes } = require('./products');
/* import { loggerMiddleware } from '../middlewares/logger.middleware.js'; */

const initRoutes = (app) => {
    /* app.use(loggerMiddleware); */
    app.use('/users', usersRouter);
    app.use(Object.values(productRoutes), productsRouter);
};

module.exports = { initRoutes };
