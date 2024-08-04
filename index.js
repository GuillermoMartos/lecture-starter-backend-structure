const express = require('express');
const EventEmitter = require('events');
const { db } = require('./src/db/db');
const { initRoutes } = require('./src/routes/routes');

const app = express();

const port = 4066;

const statEmitter = new EventEmitter();
const stats = {
    totalUsers: 3,
    totalBets: 1,
    totalEvents: 1,
};

app.use(express.json());
app.use((uselessRequest, uselessResponse, neededNext) => {
    db.raw('select 1+1 as result').then(() => {
        neededNext();
    }).catch(() => {
        throw new Error('No db connection');
    });
});

initRoutes(app);

app.get('/health', (req, res) => {
    res.send('Hello World!');
});

const server = app.listen(port, () => {
    statEmitter.on('newUser', () => {
        stats.totalUsers = +1;
    });
    statEmitter.on('newBet', () => {
        stats.totalBets = +1;
    });
    statEmitter.on('newEvent', () => {
        stats.totalEvents = +1;
    });

    console.log(`App listening at http://localhost:${port}`);
});

// Do not change this line
module.exports = {
    app, server, db, statEmitter,
};
console.log('Variables exportadas en index.js');
