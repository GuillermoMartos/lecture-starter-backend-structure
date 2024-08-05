const { Router } = require('express');
const { tokenValidationMiddleware, adminTokenValidationMiddleware } = require('../middlewares/auth-token-middleware');
const productController = require('../controllers/productController');

const router = Router();

router.post(
    '/transactions',
    tokenValidationMiddleware,
    adminTokenValidationMiddleware,
    productController.createNewTransaction,
);

router.post('/events', tokenValidationMiddleware, adminTokenValidationMiddleware, productController.createNewEvent);

router.post('/bets', tokenValidationMiddleware, productController.createNewBet);

router.get('/stats', tokenValidationMiddleware, adminTokenValidationMiddleware, productController.getStats);

module.exports = { router };
