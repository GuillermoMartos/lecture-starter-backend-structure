const joi = require('joi');

const userIdValidationSchema = joi.object({
    id: joi.string().uuid().required(),
});

const validateUserId = (params) => userIdValidationSchema.validate(params);

module.exports = {
    validateUserId,
};
