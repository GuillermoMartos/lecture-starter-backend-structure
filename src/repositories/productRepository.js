const { db, statEmitter } = require('../db/db');
const { transactionCreationModel } = require('../models/products/transactionCreationModel');

const createNewTransactionRepository = async (transactionData) => {
    const transactionDataCopy = transactionData;
    delete transactionDataCopy.tokenPayload;
    const { error: validationError } = transactionCreationModel.validate(transactionDataCopy);
    if (validationError) {
        throw validationError;
    }

    const [userFound, ...rest] = await db('user').where('id', transactionDataCopy.userId);
    if (!userFound) {
        throw new Error({ error: 'User does not exist' });
    }

    transactionDataCopy.card_number = transactionDataCopy.cardNumber;
    delete transactionDataCopy.cardNumber;
    transactionDataCopy.user_id = transactionDataCopy.userId;
    delete transactionDataCopy.userId;

    const [newTransaction, ...discard] = await db('transaction').insert(transactionDataCopy).returning('*');

    const currentBalance = transactionDataCopy.amount + userFound.balance;
    await db('user').where('id', transactionDataCopy.user_id).update('balance', currentBalance);

    ['user_id', 'card_number', 'created_at', 'updated_at'].forEach((whatakey) => {
        const index = whatakey.indexOf('_');
        let newKey = whatakey.replace('_', '');
        newKey = newKey.split('');
        newKey[index] = newKey[index].toUpperCase();
        newKey = newKey.join('');
        newTransaction[newKey] = newTransaction[whatakey];
        delete newTransaction[whatakey];
    });

    return {
        ...newTransaction,
        currentBalance,
    };
};

module.exports = {
    createNewTransactionRepository,
};
