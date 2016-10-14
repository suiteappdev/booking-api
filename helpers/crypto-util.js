var crypto = require('crypto');
var config = require('../config.js');

/* Define var */
var myHash = function (msg) {
    return crypto.createHash('sha256').update(msg).digest('hex');
  
};

module.exports = myHash;