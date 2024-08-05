const { db, statEmitter } = require('../db/db');
const { CustomError } = require('../helpers/helper');
const { betCreationModel } = require('../models/products/betCreationModel');
const { eventCreationModel } = require('../models/products/eventCreationModel');
const { eventModificationModel } = require('../models/products/eventModificationModel');
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
        throw new CustomError('User does not exist', 400);
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
        throw new CustomError('User does not exist', 400);
    }
    if (+user.balance < +betDataCopy.bet_amount) {
        throw new CustomError('Not enough balance', 400);
    }
    const [eventFound, ...rest] = await db('event').where('id', betDataCopy.event_id);
    if (!eventFound) {
        throw new CustomError('Event not found', 404);
    }
    const [oddsFound, ...discardRest] = await db('odds').where('id', eventFound.odds_id);
    if (!oddsFound) {
        throw new CustomError('Odds not found', 400);
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

const updateEventRepository = async (eventData, id) => {
    const eventDataCopy = eventData;
    delete eventDataCopy.tokenPayload; // se necesita????? siii sacarlo con estilo
    const { error: validationError } = eventModificationModel.validate(eventDataCopy);
    if (validationError) {
        throw validationError;
    }

    const eventId = id;

    const betsFound = await db('bet').where('event_id', eventId).andWhere('win', null);
    const [w1, w2] = eventDataCopy.score.split(':');
    let result;
    if (+w1 > +w2) {
        result = 'w1';
    } else if (+w2 > +w1) {
        result = 'w2';
    } else {
        result = 'x';
    }
    const [eventFound, ...rest] = await db('event').where('id', eventId).update({ score: eventDataCopy.score }).returning('*');

    betsFound.map(async (bet) => {
        if (bet.prediction === result) {
            await db('bet').where('id', bet.id).update({
                win: true,
            });

            const user = await db('user').where('id', bet.user_id);
            await db('user').where('id', bet.user_id).update({
                balance: user.balance + (bet.bet_amount * bet.multiplier),
            });
        } else if (bet.prediction !== result) {
            await db('bet').where('id', bet.id).update({
                win: false,
            });
        }
    });

    ['bet_amount', 'event_id', 'away_team', 'home_team', 'odds_id', 'start_at', 'updated_at', 'created_at'].forEach((whatakey) => {
        const index = whatakey.indexOf('_');
        let newKey = whatakey.replace('_', '');
        newKey = newKey.split('');
        newKey[index] = newKey[index].toUpperCase();
        newKey = newKey.join('');
        eventFound[newKey] = eventFound[whatakey];
        delete eventFound[whatakey];
    });

    return { ...eventFound };
};

module.exports = {
    createNewTransactionRepository,
    createNewEventRepository,
    createNewBetRepository,
    updateEventRepository,
};
