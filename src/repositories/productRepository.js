const { db, statEmitter } = require('../db/db');
const { betCreationModel } = require('../models/products/betCreationModel');
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
    delete transactionDataCopy.tokenPayload; // se necesita?????? siiiii veamos de hacer dinamico
    const { error: validationError } = eventCreationModel.validate(transactionDataCopy);
    if (validationError) {
        throw validationError;
    }

    eventDataCopy.odds.home_win = eventDataCopy.odds.homeWin;
    delete eventDataCopy.odds.homeWin;
    eventDataCopy.odds.away_win = eventDataCopy.odds.awayWin;
    delete eventDataCopy.odds.awayWin;
    const [newOdd, ...rest] = await db('odds').insert(eventDataCopy.odds).returning('*');
    delete eventDataCopy.odds;
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

const createNewBetRepository = async (betData) => {
    const betDataCopy = betData;
    const userId = betDataCopy.tokenPayload.id;
    delete betDataCopy.tokenPayload; // se necesita????? siii sacarlo con estilo
    const { error: validationError } = betCreationModel.validate(betDataCopy);
    if (validationError) {
        throw validationError;
    }

    betDataCopy.event_id = betDataCopy.eventId;
    betDataCopy.bet_amount = betDataCopy.betAmount;
    delete betDataCopy.eventId;
    delete betDataCopy.betAmount;
    betDataCopy.user_id = userId;
    const usersTable = await db.select().table('user');
    const user = await usersTable.find((_user) => _user.id === userId);
    if (!user) {
        throw Error({ error: 'User does not exist' });
    }
    if (+user.balance < +betDataCopy.bet_amount) {
        throw Error({ error: 'Not enough balance' });
    }
    const [eventFound, ...rest] = await db('event').where('id', betDataCopy.event_id);
    if (!eventFound) {
        throw Error({ error: 'Event not found' });
    }
    const [oddsFound, ...discardRest] = await db('odds').where('id', eventFound.odds_id);
    if (!oddsFound) {
        throw Error({ error: 'Odds not found' });
    }
    let multiplier;
    switch (betDataCopy.prediction) {
    case 'w1':
        multiplier = oddsFound.home_win;
        break;
    case 'w2':
        multiplier = oddsFound.away_win;
        break;
    case 'x':
        multiplier = oddsFound.draw;
        break;
    default:
        break;
    }
    const [newBet, ...discard] = await db('bet').insert({
        ...betDataCopy,
        multiplier,
        event_id: eventFound.id,
    }).returning('*');
    const currentBalance = user.balance - betDataCopy.bet_amount;
    await db('user').where('id', userId).update({
        balance: currentBalance,
    });
    statEmitter.emit('newBet');

    ['bet_amount', 'event_id', 'away_team', 'home_team', 'odds_id', 'start_at', 'updated_at', 'created_at', 'user_id'].forEach((whatakey) => {
        const index = whatakey.indexOf('_');
        let newKey = whatakey.replace('_', '');
        newKey = newKey.split('');
        newKey[index] = newKey[index].toUpperCase();
        newKey = newKey.join('');
        newBet[newKey] = newBet[whatakey];
        delete newBet[whatakey];
    });
    return {
        ...newBet,
        currentBalance,
    };
};

module.exports = {
    createNewTransactionRepository, createNewEventRepository, createNewBetRepository,
};
