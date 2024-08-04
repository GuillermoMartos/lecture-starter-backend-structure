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

router.get('/stats', (req, res) => {
    try {
        const ak = 'authorization';
        let token = req.headers[ak];
        if (!token) {
            return res.status(401).send({ error: 'Not Authorized' });
        }
        token = token.replace('Bearer ', '');
        try {
            const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
            if (tokenPayload.type != 'admin') {
                throw new Error();
            }
        } catch (err) {
            return res.status(401).send({ error: 'Not Authorized' });
        }
        res.send(stats);
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = { router };
