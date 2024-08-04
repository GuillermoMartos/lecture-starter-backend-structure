const jwt = require('jsonwebtoken');

const tokenValidationMiddleware = (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) {
        return res.status(401).send({ error: 'Not Authorized' });
    }
    token = token.replace('Bearer ', '');
    try {
        const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
        req.body.tokenPayload = tokenPayload;
    } catch (err) {
        console.error(err);
        return res.status(401).send({ error: 'Not Authorized' });
    }

    return next();
};

const adminTokenValidationMiddleware = (req, res, next) => {
    const { tokenPayload } = req.body;
    if (tokenPayload.type !== 'admin') {
        return res.status(401).send({ error: 'Not Authorized' });
    }

    return next();
};

module.exports = { tokenValidationMiddleware, adminTokenValidationMiddleware };
