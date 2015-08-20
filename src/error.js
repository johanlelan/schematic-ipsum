var config = require('config');

var log = require('winston').loggers.get('schematic-ipsum');

module.exports = function(err, req, res, next) {
    var data = (req.mdc && req.mdc({error: err})) || {error: err};
    log.error('schematic-ipsum - Internal server error', data);
    res.status(500);
    if (config.returnError) {
        res.send(err);
    } else {
        res.send('Internal server error');
    }
};