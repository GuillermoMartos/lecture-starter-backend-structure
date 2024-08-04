const joi = require('joi');

const idValidationSchema = joi.object({
    id: joi.string().uuid().required(),
});

const validateIDMiddleware = (req, res, next) => {
    const { error: validationError } = idValidationSchema.validate(req.params);
    if (validationError) {
        return res.status(400).send({ error: validationError.details[0].message });
    }

    return next();
};

module.exports = {
    validateIDMiddleware,
};
