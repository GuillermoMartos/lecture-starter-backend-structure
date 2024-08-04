const joi = require('joi');

const userSchema = joi.object({
    id: joi.string().uuid(),
    type: joi.string().required(),
    email: joi.string().email().required(),
    phone: joi.string().pattern(/^\+?3?8?(0\d{9})$/).required(),
    name: joi.string().required(),
    city: joi.string(),
}).required();

const validateUser = (body) => userSchema.validate(body);

module.exports = {
    validateUser,
};
