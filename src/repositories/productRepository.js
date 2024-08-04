const { db, statEmitter } = require('../db/db');
const { eventCreationModel } = require('../models/products/eventCreationModel');
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

const createNewEventRepository = async (eventData) => {
    const eventDataCopy = eventData;
    const transactionDataCopy = eventDataCopy;
    delete transactionDataCopy.tokenPayload; // se necesita??????
    const { error: validationError } = eventCreationModel.validate(transactionDataCopy);
    if (validationError) {
        throw validationError;
    }

    /*
    unnnecesarry right????
    eventDataCopy.odds.home_win = eventDataCopy.odds.homeWin;
    delete eventDataCopy.odds.homeWin;
    eventDataCopy.odds.away_win = eventDataCopy.odds.awayWin;
    delete eventDataCopy.odds.awayWin; */
    delete eventDataCopy.odds;
    const [newOdd, ...rest] = await db('odds').insert(eventDataCopy.odds).returning('*');
    eventDataCopy.away_team = eventDataCopy.awayTeam;
    eventDataCopy.home_team = eventDataCopy.homeTeam;
    eventDataCopy.start_at = eventDataCopy.startAt;
    delete eventDataCopy.awayTeam;
    delete eventDataCopy.homeTeam;
    delete eventDataCopy.startAt;

    const [newEvent, ...discard] = await db('event').insert({
        ...eventDataCopy,
        odds_id: newOdd.id,
    }).returning('*');

    statEmitter.emit('newEvent');

    ['bet_amount', 'event_id', 'away_team', 'home_team', 'odds_id', 'start_at', 'updated_at', 'created_at'].forEach((whatakey) => {
        const index = whatakey.indexOf('_');
        let newKey = whatakey.replace('_', '');
        newKey = newKey.split('');
        newKey[index] = newKey[index].toUpperCase();
        newKey = newKey.join('');
        newEvent[newKey] = newEvent[whatakey];
        delete newEvent[whatakey];
    });
    ['home_win', 'away_win', 'created_at', 'updated_at'].forEach((whatakey) => {
        const index = whatakey.indexOf('_');
        let newKey = whatakey.replace('_', '');
        newKey = newKey.split('');
        newKey[index] = newKey[index].toUpperCase();
        newKey = newKey.join('');
        newOdd[newKey] = newOdd[whatakey];
        delete newOdd[whatakey];
    });
    return {
        ...newEvent,
        newOdd,
    };
};

module.exports = {
    createNewTransactionRepository, createNewEventRepository,
};
