const productRepository = require('../repositories/productRepository');
const { statEmitter } = require('../db/db');

const createNewTransactionService = async (transactionData) => {
    const newTransaction = await productRepository.createNewTransactionRepository(transactionData);
    return newTransaction;
};

const createNewEventService = async (eventData) => {
    const newEvent = await productRepository.createNewEventRepository(eventData);
    return newEvent;
};

const createNewBetService = async (betData) => {
    const newBet = await productRepository.createNewBetRepository(betData);
    return newBet;
};

const getStatsService = async () => {
    const statsData = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Timeout: \'statsResult\' event did not occur.'));
        }, 5000);

        statEmitter.once('statsResult', (stats) => {
            clearTimeout(timeout);
            resolve(stats);
        });
    });

    statEmitter.emit('getStats');

    return statsData;
};

module.exports = {
    createNewTransactionService, createNewEventService, createNewBetService, getStatsService,
};
