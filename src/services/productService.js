const productRepository = require('../repositories/productRepository');

const createNewTransactionService = async (transactionData) => {
    const user = await productRepository.createNewTransactionRepository(transactionData);
    return user;
};

module.exports = {
    createNewTransactionService,
};
