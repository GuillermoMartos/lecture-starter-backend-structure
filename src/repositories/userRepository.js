const { db, statEmitter } = require('../db/db');
const { userCreationModel, userModificationModel } = require('../models/users/users');

const getUserByIDRepository = async ({ id }) => {
    const userSearched = await db('user').where('id', id).returning('*');
    return userSearched;
};

const createNewUserRepository = async (userData) => {
    const copyData = userData;
    copyData.balance = 0;
    const { error: validationError } = userCreationModel.validate(copyData);
    if (validationError) {
        throw validationError;
    }
    const newUser = await db('user').insert(copyData).returning('*');
    if (!newUser) {
        console.log('hola');
    }
    newUser.createdAt = newUser.created_at;
    delete newUser.created_at;
    newUser.updatedAt = newUser.updated_at;
    delete newUser.updated_at;
    statEmitter.emit('newUser');
    return newUser;
};

const updateUserRepository = async (userData) => {
    const newUserData = { ...userData };
    delete newUserData.tokenPayload;
    const { error: validationError } = userModificationModel.validate(newUserData);
    if (validationError) {
        throw validationError;
    }
    const updatedUser = await db('user').where('id', userData.tokenPayload.id).update(newUserData).returning('*');
    return updatedUser;
};

module.exports = {
    getUserByIDRepository,
    createNewUserRepository,
    updateUserRepository,
};
