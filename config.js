'use strict';

module.exports = (Redis) => {
    return {
        host: 'http://localhost',
        port: '3000',

        redisOptions: {
            port: 6379,
            host: 'localhost'
        },

        sessionOptions: {
            store: new Redis(this.redisOptions),
            secret: 'rETY7inyJo76wp80GSv5yj12K6dh65wLG30vy',
            resave: false,
            saveUninitialized: true,
            cookie: {secure: false}
        },

        //3rd party software
        taskSpooler: 'ts',
        bwa: 'bwa',
        rscript: 'rscript'
    }
};