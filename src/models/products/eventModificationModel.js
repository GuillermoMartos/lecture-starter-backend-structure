const joi = require('joi');

const eventModificationModel = joi.object({
    score: joi.string().required(),
}).required();

module.exports = {
    eventModificationModel,
};
