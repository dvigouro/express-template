const bunyan = require('bunyan');

const log = bunyan.createLogger({
    name: 'nodekd',
    serializers: bunyan.stdSerializers
});

module.exports = log;