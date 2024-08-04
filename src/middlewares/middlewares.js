const { validateIDMiddleware } = require('./validateIDMiddleware');
const { tokenValidationMiddleware } = require('./auth-token-middleware');

module.exports = {
    tokenValidationMiddleware, validateIDMiddleware,
};
