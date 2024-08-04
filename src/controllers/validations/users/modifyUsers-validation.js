const joi = require('joi');

const modifyUserValidationSchema = joi.object({
    email: joi.string().email(),
    phone: joi.string().pattern(/^\+?3?8?(0\d{9})$/),
    name: joi.string(),
    city: joi.string(),
    tokenPayload: joi.object(
        {
            id: joi.string(),
            type: joi.string(),
        },
    ),
}).required();

const validateUserModification = (params) => modifyUserValidationSchema.validate(params);

module.exports = {
    validateUserModification,
};
