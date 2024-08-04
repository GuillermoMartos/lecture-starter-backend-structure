const productRepository = require('../repositories/productRepository');

const createNewTransactionService = async (transactionData) => {
    const newTransaction = await productRepository.createNewTransactionRepository(transactionData);
    return newTransaction;
};

const createNewEventService = async (transactionData) => {
    const newEvent = await productRepository.createNewEventRepository(transactionData);
    return newEvent;
};

const createNewBetService = async (transactionData) => {
    const newBet = await productRepository.createNewBetRepository(transactionData);
    return newBet;
};

module.exports = {
    createNewTransactionService, createNewEventService, createNewBetService,
};
