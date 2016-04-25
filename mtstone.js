#! /usr/bin/env node
'use strict';

// Dependencies
let      fs = require('fs');
let    path = require('path');
let express = require('express');
let session = require('express-session');
let  multer = require('multer');
let   Redis = require('connect-redis')(session);
let   spawn = require('child_process').spawn;

// Config
const config = {
    port: 3000,

    redisOptions: {
        port: 6379,
        host: 'localhost'
    },

    sessionOptions: {
        store: new Redis(this.redisOptions),
        secret: 'rETY7inyJo76wp80GSv5yj12K6dh65wLG30vy',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    },

    taskSpooler: 'ts',
    bwa: 'bwa'
};
const uploadFolder = path.join(__dirname, 'uploads/');
const publicFolder = path.join(__dirname, 'public');
const emptyClientData = {
    originalNames: [],
    publicNames: [],
    fileStatus: []
};

// Express App
let app = express();
let upload = multer({ dest: uploadFolder });
app.locals.basedir = publicFolder;

app
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'jade')
    .use(express.static(publicFolder))
    .use(express.static(uploadFolder))
    .use(session(config.sessionOptions))
    .listen(config.port);

// Routes
app.get('/', (req, res) => res.render('index'));

app.post('/upload', upload.any(), (req, res) => {
    let data = req.session['clientData'];
    if (data == undefined) data = emptyClientData;

    req.files.forEach(file => {
        let extension = file.originalname.toLowerCase().match(/\.(sam|fastq)$/);

        if (extension) {
            data.originalNames.push(file.originalname);
            data.publicNames.push(file.filename);
            data.fileStatus.push(false);

            const rsrsPath = path.join(__dirname, 'library', 'bwa', 'RSRS.fa');
            const heteroplasmyPath = path.join(__dirname, 'library', 'heteroplasmy_stream.js');

            switch (extension[1]) {
                case 'sam':
                    spawn(config.taskSpooler, ['-n', 'node', heteroplasmyPath, file.path]);
                    break;

                case 'fastq':
                    const template = '#!/usr/bin/env bash\n' +
                        `${config.bwa} aln ${rsrsPath} ${file.path} > ${file.path}.sai\n` +
                        `${config.bwa} samse ${rsrsPath} ${file.path}.sai ${file.path} > ${file.path}.sam\n` +
                        `node ${heteroplasmyPath} ${file.path}.sam`;

                    fs.writeFile(
                        `${file.path}.sh`,
                        template, 'utf-8',
                        () => spawn(config.taskSpooler, ['-n', 'sh', `${file.path}.sh`])
                    );
                    break;
            }
        } else {
            fs.access(file.path, fs.W_OK, err => {
                if (!err) fs.unlink(file.path);
            });
        }
    });

    res.json({ upload: true });
});

app.post('/refresh', (req, res) => {
    let data = req.session['clientData'];
    if (data == undefined) data = emptyClientData;

    data.publicNames.forEach((file, i) =>
        fs.access(path.join(uploadFolder, `${file}.png`), fs.R_OK | fs.W_OK, err => {
            if (!err) data.fileStatus[i] = true
        })
    );

    res.json(data);
});