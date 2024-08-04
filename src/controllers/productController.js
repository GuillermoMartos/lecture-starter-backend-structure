const productService = require('../services/productService');

const createNewTransaction = async (req, res) => {
    try {
        const newTransaction = await productService.createNewTransactionService(req.body);
        res.send({ ...newTransaction });
    } catch (error) {
        if (error.code === '23505') {
            res.status(400).send({
                error: error.detail,
            });
        }
        res.status(500).send('Internal Server Error');
    }
};
const createNewEvent = async (req, res) => {
    try {
        const newTransaction = await productService.createNewEventService(req.body);
        res.send({ ...newTransaction });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    createNewTransaction, createNewEvent,
};
