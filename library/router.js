'use strict';

let      fs = require('fs');
let    path = require('path');
let     pug = require('pug');
let  multer = require('multer');
let   spawn = require('child_process').spawn;

module.exports = (app, config) => {
    let upload = multer({ dest: config.uploadFolder });

    function initClientData() {
        return {
            originalNames: [],
            publicNames: [],
            fileStatus: [],
            host: config.host + ':' + config.port + '/'
        };
    }

    // Index
    app.get('/', (req, res) => res.render('index'));
    
    // Clear list of samples
    app.get('/clear', (req, res) => {
        req.session.destroy(() => {});
        res.redirect('/');
    });

    // Upload and process user files
    app.post('/upload', upload.any(), (req, res) => {
        if (req.session['clientData'] == undefined) {
            req.session['clientData'] = initClientData();
        }

        req.files.forEach(file => {
            let extension = file.originalname.toLowerCase().match(/\.(sam|fastq)$/);

            if (extension) {
                req.session['clientData'].originalNames.push(file.originalname);
                req.session['clientData'].publicNames.push(file.filename);
                req.session['clientData'].fileStatus.push(false);

                switch (extension[1]) {
                    case 'sam':
                        spawn(config.taskSpooler, ['-n', 'node', config.heteroplasmyPath, file.path]);
                        break;

                    case 'fastq':
                        const template = '#!/usr/bin/env bash\n' +
                            `${config.bwa} aln ${config.rsrsPath} ${file.path} > ${file.path}.sai\n` +
                            `${config.bwa} samse ${config.rsrsPath} ${file.path}.sai ${file.path} > ${file.path}.sam\n` +
                            `node ${config.heteroplasmyPath} ${file.path}.sam`;

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

    // Refresh list of samples
    app.post('/refresh', (req, res) => {
        if (req.session['clientData'] == undefined) {
            req.session['clientData'] = initClientData();
            res.json({});
        } else {
            for (let i = 0; i < req.session['clientData'].originalNames.length; i++) {
                fs.access(path.join(config.uploadFolder, `${req.session['clientData'].publicNames[i]}.png`), fs.R_OK, err => {
                    if (!err) req.session['clientData'].fileStatus[i] = true;

                    let list = pug.compileFile(config.generateListPath)(req.session['clientData']);

                    if (i == req.session['clientData'].originalNames.length - 1) res.json({ list });
                });
            }
        }
    });
};