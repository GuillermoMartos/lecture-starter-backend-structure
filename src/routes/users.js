const { Router } = require('express');
const jwt = require('jsonwebtoken');
const { db, statEmitter } = require('../db/db');
const { validateUserCreation, validateUserId, validateUserModification } = require('../controllers/validations/users/users-validations');
const { tokenValidationMiddleware } = require('../controllers/middlewares/auth-token-middleware');

const router = Router();

router.get('/:id', async (req, res) => {
    const { error: validationError } = validateUserId(req.params);
    if (validationError) {
        res.status(400).send({ error: validationError.details[0].message });
        return;
    }
    try {
        const result = await db('user').where('id', req.params.id).returning('*');
        if (!result) {
            res.status(404).send({ error: 'User not found' });
            return;
        }
        res.send({
            ...result,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('', (req, res) => {
    const { error: validationError } = validateUserCreation(req.body);
    if (validationError) {
        res.status(400).send({ error: validationError.details[0].message });
        return;
    }

    req.body.balance = 0;
    db('user').insert(req.body).returning('*').then(([result]) => {
        result.createdAt = result.created_at;
        // repository logic
        delete result.created_at;
        result.updatedAt = result.updated_at;
        delete result.updated_at;
        statEmitter.emit('newUser');
        return res.send({
            ...result,
            accessToken: jwt.sign({ id: result.id, type: result.type }, process.env.JWT_SECRET),
        });
    })
        .catch((err) => {
            if (err.code === '23505') {
                res.status(400).send({
                    error: err.detail,
                });
                return;
            }
            res.status(500).send('Internal Server Error');
        });
});

router.put('/:id', tokenValidationMiddleware, (req, res) => {
    const { error: validationError } = validateUserModification(req.body);
    if (validationError) {
        res.status(400).send({ error: validationError.details[0].message });
        return;
    }

    if (req.params.id !== req.body.tokenPayload.id) {
        res.status(401).send({ error: 'UserId mismatch' });
        return;
    }

    db('user').where('id', req.params.id).update(req.body).returning('*')
        .then(([result]) => res.send({
            ...result,
        }))
        .catch((err) => {
            if (err.code === '23505') {
                console.log(err);
                res.status(400).send({
                    error: err.detail,
                });
                return;
            }
            console.log(err);
            res.status(500).send('Internal Server Error');
        });
});

module.exports = { router };
