const { CustomError } = require('../helpers/helper');

const errorHandlerMiddleware = (err, req, res, next) => {
    if (err.code === '23505') {
        return res.status(400).json({
            error: err.detail,
        });
    }

    if (err.isJoi) {
        return res.status(400).json({
            error: err.details[0].message,
        });
    }

    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    console.error(err);
    return res.status(500).json({
        error: 'Internal Server Error',
    });
};

module.exports = { errorHandlerMiddleware };
