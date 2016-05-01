#! /usr/bin/env node
'use strict';

// Dependencies
let    path = require('path');
let express = require('express');
let session = require('express-session');
let   Redis = require('connect-redis')(session);

let    init = require(path.join(__dirname, 'config.js'));
let  router = require(path.join(__dirname, 'library', 'router.js'));

// Config
const config = init(Redis);

// Express App
let app = express();
app.locals.basedir = config.publicFolder;

app
    .set('views', config.viewsFolder)
    .set('view engine', 'pug')
    .use(express.static(config.publicFolder))
    .use(express.static(config.uploadFolder))
    .use(session(config.sessionOptions))
    .listen(config.port);

// Routes
router(app, config);