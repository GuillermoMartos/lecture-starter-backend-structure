const productService = require('../services/productService');

const createNewTransaction = async (req, res, next) => {
    try {
        const newTransaction = await productService.createNewTransactionService(req.body);
        res.send({ ...newTransaction });
    } catch (error) {
        next(error);
    }
};
const createNewEvent = async (req, res, next) => {
    try {
        const newTransaction = await productService.createNewEventService(req.body);
        res.send({ ...newTransaction });
    } catch (error) {
        next(error);
    }
};

const updateEvent = async (req, res, next) => {
    try {
        const updatedEvent = await productService.updateEventService(req.body, req.params);
        res.send({ ...updatedEvent });
    } catch (error) {
        next(error);
    }
};

const createNewBet = async (req, res, next) => {
    try {
        const newBet = await productService.createNewBetService(req.body);
        return res.send({ ...newBet });
    } catch (error) {
        return next(error);
    }
};

const getStats = async (req, res, next) => {
    try {
        const stats = await productService.getStatsService(req.body);
        return res.send(stats);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createNewTransaction, createNewEvent, createNewBet, getStats, updateEvent,
};
