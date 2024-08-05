const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const getUserByIDService = async (userId) => {
    const [user, ...rest] = await userRepository.getUserByIDRepository(userId);
    return user;
};

const createNewUserService = async (userData) => {
    const user = await userRepository.createNewUserRepository(userData);
    const accessToken = jwt.sign({ id: user.id, type: user.type }, process.env.JWT_SECRET);
    return {
        ...user,
        accessToken,
    };
};

const updateUserService = async (userData) => {
    const [user, ...rest] = await userRepository.updateUserRepository(userData);
    return {
        ...user,
        accessToken: jwt.sign({ id: user.id, type: user.type }, process.env.JWT_SECRET),
    };
};

module.exports = {
    getUserByIDService, updateUserService, createNewUserService,
};
