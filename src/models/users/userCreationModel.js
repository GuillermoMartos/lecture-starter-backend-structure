const joi = require('joi');

const userCreationModel = joi.object({
    id: joi.string().uuid(),
    type: joi.string().required(),
    email: joi.string().email().required(),
    phone: joi.string().pattern(/^\+?3?8?(0\d{9})$/).required(),
    name: joi.string().required(),
    city: joi.string(),
    balance: joi.number(),
}).required();

module.exports = {
    userCreationModel,
};
