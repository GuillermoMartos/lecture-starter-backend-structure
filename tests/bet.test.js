const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { server } = require('../index');

const { expect } = chai;

console.log = () => {};

chai.use(chaiHttp);

const BASE_DATA = {
    eventId: '154baa1f-2102-4874-a488-aa2713b9c2d3',
    betAmount: 45,
    prediction: 'w1',
};

const JWT_DATA = {
    type: 'client',
    id: '0f290598-1b54-4a36-8c58-33caa7d08b5f',
};

describe('BETS_ROUTES', () => {
    afterAll(() => {
        server.close();
    });

    describe('BETS_ROUTE_POST', () => {
        it('POST_BET', async () => {
            const token = jwt.sign(
                JWT_DATA,
                process.env.JWT_SECRET,
            );
            const { status, body } = await chai
                .request(server)
                .post('/bets')
                .set('authorization', `Bearer ${token}`)
                .send(BASE_DATA);

            expect(status).to.be.equal(200);
            expect(body).to.include.all.keys(
                'id',
                'betAmount',
                'eventId',
                'createdAt',
                'multiplier',
                'prediction',
                'userId',
                'updatedAt',
                'win',
                'currentBalance',
            );
            expect(body.currentBalance).to.be.equal(5);
        });

        it('POST_BET_INVALID_PREDICTION', async () => {
            const data = {
                ...BASE_DATA,
                prediction: 'w3',
            };

            const token = jwt.sign(
                JWT_DATA,
                process.env.JWT_SECRET,
            );
            const { status, body } = await chai
                .request(server)
                .post('/bets')
                .set('authorization', `Bearer ${token}`)
                .send(data);

            expect(status).to.be.equal(400);
            expect(body.error).to.be.equal('"prediction" must be one of [w1, w2, x]');
        });

        it('POST_BET_AUTH_MISSING', async () => {
            const { status, body } = await chai.request(server).post('/bets').send(BASE_DATA);

            expect(status).to.be.equal(401);
            expect(body.error).to.be.equal('Not Authorized');
        });

        it('POST_BET_USER_NOT_FOUND', async () => {
            const token = jwt.sign(
                { ...JWT_DATA, id: 'e4a9d82f-97f3-4e3d-adf9-09de4148a744' },
                process.env.JWT_SECRET,
            );
            const { status, body } = await chai
                .request(server)
                .post('/bets')
                .set('authorization', `Bearer ${token}`)
                .send(BASE_DATA);

            expect(status).to.be.equal(400);
            expect(body.error).to.be.equal('User does not exist');
        });

        it('POST_BET_EVENT_NOT_FOUND', async () => {
            const data = {
                ...BASE_DATA,
                eventId: 'e072aba5-92e7-41bd-8025-97a4f4308b9c',
                betAmount: 1,
            };

            const token = jwt.sign(
                JWT_DATA,
                process.env.JWT_SECRET,
            );
            const { status, body } = await chai
                .request(server)
                .post('/bets')
                .set('authorization', `Bearer ${token}`)
                .send(data);

            expect(status).to.be.equal(404);
            expect(body.error).to.be.equal('Event not found');
        });

        it('POST_BET_INVALID_BALANCE', async () => {
            const token = jwt.sign(
                JWT_DATA,
                process.env.JWT_SECRET,
            );
            const { status, body } = await chai
                .request(server)
                .post('/bets')
                .set('authorization', `Bearer ${token}`)
                .send(BASE_DATA);

            expect(status).to.be.equal(400);
            expect(body.error).to.be.equal('Not enough balance');
        });
    });
});
