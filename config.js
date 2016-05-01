'use strict';
let path = require('path');

module.exports = (Redis) => {
    return {
        host: 'http://localhost',
        port: '3000',

            uploadFolder: path.join(__dirname, 'uploads/'),
            publicFolder: path.join(__dirname, 'public'),
             viewsFolder: path.join(__dirname, 'views'),

                rsrsPath: path.join(__dirname, 'library', 'bwa', 'RSRS.fa'),
        heteroplasmyPath: path.join(__dirname, 'library', 'heteroplasmy_stream.js'),
        generateListPath: path.join(__dirname, 'library', 'generate_list.pug'),

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