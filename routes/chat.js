const express = require('express');
const router = express.Router();

const { 
    getChat, newChat, updateChat
} = require('../controllers/chatController');

const { isAuthenticatedUser,authorizeRoles } = require('../middlewares/auth');

router.route('/chat/:id').get(isAuthenticatedUser, authorizeRoles('administrator','user'), getChat);
router.route('/chat/new').post(isAuthenticatedUser, authorizeRoles('administrator','user'), newChat);
router.route('/chat/:id').put(isAuthenticatedUser, authorizeRoles('administrator','user'), updateChat);

module.exports = router;