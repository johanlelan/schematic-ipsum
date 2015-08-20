module.exports = {
    serviceName: 'schematic-ipsum',
    port: '3110',
    // specify that the traces from technical errors should be sent to the client
    returnError: true,
    logOptions: {
        transports: {
            console: {
                type: 'Console',
                level: 'info',
                colorize: true,
                prettyPrint: true
            },
            consoleError: {
                type: 'Console',
                level: 'error',
                colorize: true,
                prettyPrint: true
            }
        },
        loggers: {
            'schematic-ipsum': ['console'], // logger of this service itself
            // logger of all submodules used by this service
            default: ['consoleError']
        }
    }
};
