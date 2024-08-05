const userService = require('../services/userService');

const getUserByID = async (req, res, next) => {
    try {
        const result = await userService.getUserByIDService(req.params);
        if (!result) {
            res.status(404).send({ error: 'User not found' });
            return;
        }
        res.send({ ...result });
    } catch (error) {
        next(error);
    }
};

const createNewUser = async (req, res, next) => {
    try {
        const newUser = await userService.createNewUserService(req.body);
        res.send({ ...newUser });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    if (req.params.id !== req.body.tokenPayload.id) {
        res.status(401).send({ error: 'UserId mismatch' });
        return;
    }
    try {
        const updatedUser = await userService.updateUserService(req.body);
        res.send({ ...updatedUser });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserByID,
    createNewUser,
    updateUser,
};
