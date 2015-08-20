var express = require("express");
var bodyParser = require('body-parser');
var async = require("async");
var winston = require('winston');
var _ = require("./underscoreExt");

var schema = require("./schema");

var log = winston.loggers.get('schematic-ipsum');
var router = express.Router();
var MAX_ITEMS = 100;

// Use body-parser middleware
router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json({
    strict: false
}));

var post = function(req, res) {
    return async.waterfall([
        function (done) {
            if ((!(req.body != null)) || (_.isEmpty(req.body))) {
                return done("Request missing body, which should be JSON schema.");
            } else {
                return done(null);
            }
        }, function (done) {
            var _base, _ref;
            if ((_ref = (_base = req.query).n) == null) {
                _base.n = 1;
            }
            req.query.n = parseInt(req.query.n);
            if (!_.isNumber(req.query.n)) {
                return done("Query param \"n\" must be a number, you sent " + req.query.n);
            } else if (!(req.query.n > 0 && req.query.n <= MAX_ITEMS)) {
                return done("Query param \"n\" must be between 0 and " + MAX_ITEMS);
            } else {
                return done(null);
            }
        }, function (done) {
            return done(schema.validate(req.body));
        }, function (done) {
            return schema.genIpsums(req, res, req.query.n, done);
        }
    ], function (err, ipsums) {
        var response;
        if (err != null) {
            console.error(err);
            return res.send(400, err);
        } else {
            res.statusCode = 200;
            return res.end();
        }
    });
};

router.post('/', post);

module.exports = router;