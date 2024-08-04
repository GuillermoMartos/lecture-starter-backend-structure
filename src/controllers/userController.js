const userService = require('../services/userService');

const getUserByID = async (req, res) => {
    try {
        const result = await userService.getUserByIDService(req.params);
        if (!result) {
            res.status(404).send({ error: 'User not found' });
            return;
        }
        res.send({ ...result });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

const createNewUser = async (req, res) => {
    try {
        const newUser = await userService.createNewUserService(req.body);
        res.send({ ...newUser });
    } catch (error) {
        if (error.code === '23505') {
            res.status(400).send({
                error: error.detail,
            });
            return;
        }
        res.status(500).send('Internal Server Error');
    }
};

const updateUser = async (req, res) => {
    if (req.params.id !== req.body.tokenPayload.id) {
        res.status(401).send({ error: 'UserId mismatch' });
        return;
    }
    try {
        const updatedUser = await userService.updateUserService(req.body);
        res.send({ ...updatedUser });
    } catch (error) {
        if (error.code === '23505') {
            res.status(400).send({
                error: error.detail,
            });
            return;
        }
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getUserByID,
    createNewUser,
    updateUser,
};
