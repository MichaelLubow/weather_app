"use strict";

var bcrypt = require('bcrypt');

// Generates hash using bCrypt
var createHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

var isValidPassword = function(user, password) {
    return bcrypt.compareSync(password, user.password);
};

var createDemoUser = function() {
    return {
        id: '1',
        username: 'user1',
        password: createHash("user1")
    };
};

module.exports = {
    user: createDemoUser(),
    isValidPassword: isValidPassword
};