const productRepository = require('../repositories/productRepository');

const createNewTransactionService = async (transactionData) => {
    const user = await productRepository.createNewTransactionRepository(transactionData);
    return user;
};
const createNewEventService = async (transactionData) => {
    const user = await productRepository.createNewEventRepository(transactionData);
    return user;
};

module.exports = {
    createNewTransactionService, createNewEventService,
};
