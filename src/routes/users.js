const { Router } = require('express');
const { tokenValidationMiddleware, validateIDMiddleware } = require('../middlewares/middlewares');
const userController = require('../controllers/userController');

const router = Router();

router.get('/:id', validateIDMiddleware, userController.getUserByID);

router.post('', userController.createNewUser);

router.put('/:id', tokenValidationMiddleware, validateIDMiddleware, userController.updateUser);

module.exports = { router };
