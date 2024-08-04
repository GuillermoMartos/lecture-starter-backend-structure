const joi = require('joi');

const betCreationModel = joi.object({
    id: joi.string().uuid(),
    eventId: joi.string().uuid().required(),
    betAmount: joi.number().min(1).required(),
    prediction: joi.string().valid('w1', 'w2', 'x').required(),
}).required();

module.exports = {
    betCreationModel,
};
