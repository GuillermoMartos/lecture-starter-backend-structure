const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { server } = require('../index');

const { expect } = chai;

console.log = () => {};

chai.use(chaiHttp);

const SEEDED_EVENT_ID = '154baa1f-2102-4874-a488-aa2713b9c2d3';

const DATA = {
    type: 'football',
    homeTeam: 'Ukraine',
    awayTeam: 'Netherlands',
    startAt: '2021-06-13T22:22:09.900Z',
    odds: {
        homeWin: 1.2,
        awayWin: 3.0,
        draw: 2.8,
    },
};

const JWT_ADMIN = { type: 'admin' };
const JWT_CLIENT = { type: 'client' };

describe('EVENTS_ROUTES', () => {
    afterAll(() => {
        server.close();
    });

    describe('EVENTS_ROUTE_POST', () => {
        it('POST_EVENT', async () => {
            const token = jwt.sign(JWT_ADMIN, process.env.JWT_SECRET);
            const { status, body } = await chai
                .request(server)
                .post('/events')
                .set('authorization', `Bearer ${token}`)
                .send(DATA);

            expect(status).to.be.equal(200);
            expect(body).to.include.all.keys(
                'id',
                'awayTeam',
                'homeTeam',
                'oddsId',
                'score',
                'startAt',
                'type',
                'updatedAt',
                'odds',
            );
            expect(body.odds).to.include.all.keys(
                'id',
                'homeWin',
                'draw',
                'awayWin',
                'createdAt',
                'updatedAt',
            );
        });

        it('POST_EVENT_INVALID_ODDS', async () => {
            const data = {
                type: 'football',
                homeTeam: 'Ukraine',
                awayTeam: 'Netherlands',
                startAt: '2021-06-13T22:22:09.900Z',
                odds: {
                    homeWin: '1',
                    awayWin: 3.0,
                    draw: 2.8,
                },
            };

            const token = jwt.sign(JWT_ADMIN, process.env.JWT_SECRET);
            const { status, body } = await chai
                .request(server)
                .post('/events')
                .set('authorization', `Bearer ${token}`)
                .send(data);

            expect(status).to.be.equal(400);
            expect(body.error).to.be.equal(
                '"odds.homeWin" must be greater than or equal to 1.01',
            );
        });

        it('POST_EVENT_AUTH_MISSING', async () => {
            const { status, body } = await chai
                .request(server)
                .post('/events')
                .send(DATA);

            expect(status).to.be.equal(401);
            expect(body.error).to.be.equal('Not Authorized');
        });

        it('POST_EVENT_INVALID_TOKEN', async () => {
            const token = jwt.sign(JWT_CLIENT, process.env.JWT_SECRET);
            const { status, body } = await chai
                .request(server)
                .post('/events')
                .set('authorization', `Bearer ${token}`)
                .send(DATA);

            expect(status).to.be.equal(401);
            expect(body.error).to.be.equal('Not Authorized');
        });
    });

    describe('EVENTS_ROUTE_PUT_BY_ID', () => {
        const data = {
            score: '2:1',
        };

        it('PUT_EVENT', async () => {
            const token = jwt.sign(JWT_ADMIN, process.env.JWT_SECRET);
            const { status, body } = await chai
                .request(server)
                .put(`/events/${SEEDED_EVENT_ID}`)
                .set('authorization', `Bearer ${token}`)
                .send(data);

            expect(status).to.be.equal(200);
            expect(body).to.include.all.keys(
                'id',
                'awayTeam',
                'homeTeam',
                'oddsId',
                'score',
                'startAt',
                'type',
                'updatedAt',
                'createdAt',
            );
            expect(body.score).to.be.equal(data.score);

            const userId = '860329e2-ae5c-49f4-ba8b-38c49c6e1838';
            const { body: user } = await chai.request(server).get(`/users/${userId}`);
            expect(user.balance).to.be.equal(140);
        });

        it('PUT_EVENT_INVALID_SCORE', async () => {
            const data = {
                score: 1,
            };
            const token = jwt.sign(JWT_ADMIN, process.env.JWT_SECRET);
            const { status, body } = await chai
                .request(server)
                .put(`/events/${SEEDED_EVENT_ID}`)
                .set('authorization', `Bearer ${token}`)
                .send(data);

            expect(status).to.be.equal(400);
            expect(body.error).to.be.equal('"score" must be a string');
        });

        it('PUT_EVENT_AUTH_MISSING', async () => {
            const { status, body } = await chai
                .request(server)
                .put(`/events/${SEEDED_EVENT_ID}`)
                .send(data);

            expect(status).to.be.equal(401);
            expect(body.error).to.be.equal('Not Authorized');
        });

        it('PUT_EVENT_INVALID_TOKEN', async () => {
            const token = jwt.sign(JWT_CLIENT, process.env.JWT_SECRET);
            const { status, body } = await chai
                .request(server)
                .put(`/events/${SEEDED_EVENT_ID}`)
                .set('authorization', `Bearer ${token}`)
                .send(data);

            expect(status).to.be.equal(401);
            expect(body.error).to.be.equal('Not Authorized');
        });
    });
});
