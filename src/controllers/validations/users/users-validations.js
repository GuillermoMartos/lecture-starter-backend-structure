const { validateUserCreation } = require('./createUsers-validation');
const { validateUserId } = require('./usersById-validation');
const { validateUserModification } = require('./modifyUsers-validation');

module.exports = {
    validateUserCreation, validateUserId, validateUserModification,
};
