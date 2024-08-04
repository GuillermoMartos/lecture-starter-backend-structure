const { Router } = require('express');
const { tokenValidationMiddleware, adminTokenValidationMiddleware } = require('../middlewares/auth-token-middleware');
const productController = require('../controllers/productController');

const router = Router();

router.post(
    '/transactions',
    tokenValidationMiddleware,
    adminTokenValidationMiddleware,
    productController.createNewTransaction,
);

router.post('/events', tokenValidationMiddleware, adminTokenValidationMiddleware, productController.createNewEvent);

router.post('/bets', (req, res) => {
    const schema = joi.object({
        id: joi.string().uuid(),
        eventId: joi.string().uuid().required(),
        betAmount: joi.number().min(1).required(),
        prediction: joi.string().valid('w1', 'w2', 'x').required(),
    }).required();
    const isValidResult = schema.validate(req.body);
    if (isValidResult.error) {
        res.status(400).send({ error: isValidResult.error.details[0].message });
        return;
    }

    let userId;
    try {
        const authorizationKey = 'authorization';
        let token = req.headers[authorizationKey];
        if (!token) {
            return res.status(401).send({ error: 'Not Authorized' });
        }
        token = token.replace('Bearer ', '');
        try {
            const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
            userId = tokenPayload.id;
        } catch (err) {
            console.log(err);
            return res.status(401).send({ error: 'Not Authorized' });
        }

        req.body.event_id = req.body.eventId;
        req.body.bet_amount = req.body.betAmount;
        delete req.body.eventId;
        delete req.body.betAmount;
        req.body.user_id = userId;
        db.select().table('user').then((users) => {
            const user = users.find((u) => u.id == userId);
            if (!user) {
                res.status(400).send({ error: 'User does not exist' });
                return;
            }
            if (+user.balance < +req.body.bet_amount) {
                return res.status(400).send({ error: 'Not enough balance' });
            }
            db('event').where('id', req.body.event_id).then(([event]) => {
                if (!event) {
                    return res.status(404).send({ error: 'Event not found' });
                }
                db('odds').where('id', event.odds_id).then(([odds]) => {
                    if (!odds) {
                        return res.status(404).send({ error: 'Odds not found' });
                    }
                    let multiplier;
                    switch (req.body.prediction) {
                    case 'w1':
                        multiplier = odds.home_win;
                        break;
                    case 'w2':
                        multiplier = odds.away_win;
                        break;
                    case 'x':
                        multiplier = odds.draw;
                        break;
                    }
                    db('bet').insert({
                        ...req.body,
                        multiplier,
                        event_id: event.id,
                    }).returning('*').then(([bet]) => {
                        const currentBalance = user.balance - req.body.bet_amount;
                        db('user').where('id', userId).update({
                            balance: currentBalance,
                        }).then(() => {
                            statEmitter.emit('newBet');
                            ['bet_amount', 'event_id', 'away_team', 'home_team', 'odds_id', 'start_at', 'updated_at', 'created_at', 'user_id'].forEach((whatakey) => {
                                const index = whatakey.indexOf('_');
                                let newKey = whatakey.replace('_', '');
                                newKey = newKey.split('');
                                newKey[index] = newKey[index].toUpperCase();
                                newKey = newKey.join('');
                                bet[newKey] = bet[whatakey];
                                delete bet[whatakey];
                            });
                            return res.send({
                                ...bet,
                                currentBalance,
                            });
                        });
                    });
                });
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.put('/events/:id', (req, res) => {
    const schema = joi.object({
        score: joi.string().required(),
    }).required();
    const isValidResult = schema.validate(req.body);
    if (isValidResult.error) {
        res.status(400).send({ error: isValidResult.error.details[0].message });
        return;
    }

    try {
        const authorization = 'authorization';
        let token = req.headers[authorization];
        if (!token) {
            return res.status(401).send({ error: 'Not Authorized' });
        }
        token = token.replace('Bearer ', '');
        try {
            const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
            if (tokenPayload.type != 'admin') {
                throw new Error();
            }
        } catch (err) {
            console.log(err);
            return res.status(401).send({ error: 'Not Authorized' });
        }

        const eventId = req.params.id;
        console.log(eventId);
        db('bet').where('event_id', eventId).andWhere('win', null).then((bets) => {
            const [w1, w2] = req.body.score.split(':');
            let result;
            if (+w1 > +w2) {
                result = 'w1';
            } else if (+w2 > +w1) {
                result = 'w2';
            } else {
                result = 'x';
            }
            db('event').where('id', eventId).update({ score: req.body.score }).returning('*')
                .then(([event]) => {
                    Promise.all(bets.map((bet) => {
                        if (bet.prediction == result) {
                            db('bet').where('id', bet.id).update({
                                win: true,
                            });
                            db('user').where('id', bet.user_id).then(([user]) => db('user').where('id', bet.user_id).update({
                                balance: user.balance + (bet.bet_amount * bet.multiplier),
                            }));
                        } else if (bet.prediction != result) {
                            return db('bet').where('id', bet.id).update({
                                win: false,
                            });
                        }
                    }));
                    setTimeout(() => {
                        ['bet_amount', 'event_id', 'away_team', 'home_team', 'odds_id', 'start_at', 'updated_at', 'created_at'].forEach((whatakey) => {
                            const index = whatakey.indexOf('_');
                            let newKey = whatakey.replace('_', '');
                            newKey = newKey.split('');
                            newKey[index] = newKey[index].toUpperCase();
                            newKey = newKey.join('');
                            event[newKey] = event[whatakey];
                            delete event[whatakey];
                        });
                        res.send(event);
                    }, 1000);
                });
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/stats', (req, res) => {
    try {
        const ak = 'authorization';
        let token = req.headers[ak];
        if (!token) {
            return res.status(401).send({ error: 'Not Authorized' });
        }
        token = token.replace('Bearer ', '');
        try {
            const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
            if (tokenPayload.type != 'admin') {
                throw new Error();
            }
        } catch (err) {
            return res.status(401).send({ error: 'Not Authorized' });
        }
        res.send(stats);
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = { router };
