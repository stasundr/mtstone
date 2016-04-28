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
let     pug = require('pug');
let    init = require(path.join(__dirname, 'config.js'));

// Config
const config = init(Redis);
const uploadFolder = path.join(__dirname, 'uploads/');
const publicFolder = path.join(__dirname, 'public');
const viewsFolder = path.join(__dirname, 'views');

// Express App
let app = express();
let upload = multer({ dest: uploadFolder });
app.locals.basedir = publicFolder;

app
    .set('views', viewsFolder)
    .set('view engine', 'pug')
    .use(express.static(publicFolder))
    .use(express.static(uploadFolder))
    .use(session(config.sessionOptions))
    .listen(config.port);

// Routes
app.get('/', (req, res) => res.render('index'));

app.get('/clear', (req, res) => {
    req.session.destroy(() => {});
    res.redirect('/');
});

app.post('/upload', upload.any(), (req, res) => {
    if (req.session['clientData'] == undefined) {
        req.session['clientData'] = {
            originalNames: [],
            publicNames: [],
            fileStatus: [],
            host: config.host + ':' + config.port + '/'
        };
    }
    
    req.files.forEach(file => {
        let extension = file.originalname.toLowerCase().match(/\.(sam|fastq)$/);

        if (extension) {
            req.session['clientData'].originalNames.push(file.originalname);
            req.session['clientData'].publicNames.push(file.filename);
            req.session['clientData'].fileStatus.push(false);

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

                    fs.writeFile(`${file.path}.sh`, template, 'utf-8', () => {
                        spawn(config.taskSpooler, ['-n', 'sh', `${file.path}.sh`])
                    });
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
    if (req.session['clientData'] == undefined) req.session['clientData'] = {
        originalNames: [],
        publicNames: [],
        fileStatus: [],
        host: config.host + ':' + config.port + '/'
    };

    for (let i = 0; i < req.session['clientData'].originalNames.length; i++) {
        fs.access(path.join(uploadFolder, `${req.session['clientData'].publicNames[i]}.png`), fs.R_OK, err => {
            if (!err) req.session['clientData'].fileStatus[i] = true;

            let list = pug.compileFile(path.join(__dirname, 'library', 'generate_list.pug'))(req.session['clientData']);

            if (i == req.session['clientData'].originalNames.length - 1) res.json({ list });
        });
    }
});