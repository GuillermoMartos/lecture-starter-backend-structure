const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { server } = require('../index');

const { expect } = chai;

console.log = () => {};

chai.use(chaiHttp);

const SEEDED_USER_ID = 'c486ab55-5c4b-4689-8f57-ace155ea65b4';

const DATA = {
    userId: SEEDED_USER_ID,
    cardNumber: '111111111111',
    amount: 50,
};

const JWT_ADMIN = { type: 'admin' };
const JWT_CLIENT = { type: 'client' };

describe('TRANSACTIONS_ROUTES', () => {
    afterAll(() => {
        server.close();
    });

    describe('TRANSACTIONS_ROUTE_POST', () => {
        it('POST_TRANSACTION', async () => {
            const token = jwt.sign(JWT_ADMIN, process.env.JWT_SECRET);
            const { status, body } = await chai
                .request(server)
                .post('/transactions')
                .set('authorization', `Bearer ${token}`)
                .send(DATA);

            expect(status).to.be.equal(200);
            expect(body).to.include.all.keys(
                'id',
                'amount',
                'cardNumber',
                'createdAt',
                'currentBalance',
                'updatedAt',
                'userId',
            );
            expect(body.currentBalance).to.be.equal(50);
        });

        it('POST_TRANSACTION_INVALID_AMOUNT', async () => {
            const data = {
                ...DATA,
                amount: -1,
            };

            const token = jwt.sign(JWT_ADMIN, process.env.JWT_SECRET);
            const { status, body } = await chai
                .request(server)
                .post('/transactions')
                .set('authorization', `Bearer ${token}`)
                .send(data);

            expect(status).to.be.equal(400);
            expect(body.error).to.be.equal(
                '"amount" must be greater than or equal to 0',
            );
        });

        it('POST_TRANSACTION_AUTH_MISSING', async () => {
            const { status, body } = await chai
                .request(server)
                .post('/transactions')
                .send(DATA);

            expect(status).to.be.equal(401);
            expect(body.error).to.be.equal('Not Authorized');
        });

        it('POST_TRANSACTION_INVALID_TOKEN', async () => {
            const token = jwt.sign(JWT_CLIENT, process.env.JWT_SECRET);
            const { status, body } = await chai
                .request(server)
                .post('/transactions')
                .set('authorization', `Bearer ${token}`)
                .send(DATA);

            expect(status).to.be.equal(401);
            expect(body.error).to.be.equal('Not Authorized');
        });

        it('POST_TRANSACTION_USER_NOT_FOUND', async () => {
            const data = {
                ...DATA,
                userId: '5d16d28f-f190-4e74-89bb-0fc1455d7cc6',
            };

            const token = jwt.sign(JWT_ADMIN, process.env.JWT_SECRET);
            const { status, body } = await chai
                .request(server)
                .post('/transactions')
                .set('authorization', `Bearer ${token}`)
                .send(data);

            expect(status).to.be.equal(400);
            expect(body.error).to.be.equal('User does not exist');
        });
    });
});
