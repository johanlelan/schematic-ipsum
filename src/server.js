var express = require("express");
var http = require("http");
var config = require('config');
var _ = require("./underscoreExt");
var cors = require('cors');

var errorMiddleware = require('./error');

var app = express();

// Prepare logger.
// Beware it is better done before requiring other modules,
// as they can depend on it being configured before loading.
var winston = require('winston');
winston.transports.LogstashUDP = require('winston-logstash-udp').LogstashUDP;
require('winston-configure')(config.logOptions);
var log = winston.loggers.get('schematic-ipsum');

app.set("name", "Schematic Ipsum");

app.set("port", process.env.PORT || 3000);

app.use(cors());

// view engine setup
var favicon = require('serve-favicon');
var path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(errorMiddleware);

app.use(require('./router'));

var server = http.createServer();
server = app.listen(config.port, function () {
    return log.info("" + config.serviceName + " listening on port " + config.port);
});
