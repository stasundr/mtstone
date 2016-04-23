#! /usr/bin/env node
'use strict';

let    fs = require('fs');
let spawn = require('child_process').spawn;

let path = process.argv[2];
let data = fs
    .readFileSync(path, 'utf-8')
    .split('\n')
    .filter(row => { return row.split('\t').length > 9 })
    .map(row => {
        row = row.split('\t');
        return { position: parseInt(row[3]), sequence: row[9].split('') }
    })
    .reduce((heteroplasmyMap, read) => {
        read.sequence.forEach((n, i) => {
            i += read.position;
            if (!heteroplasmyMap[i]) heteroplasmyMap[i] = (new Array(7)).fill(0);
            heteroplasmyMap[i]['ATGCN-U'.indexOf(n.match(/[ATGCN-]/i) || 'U')]++;
        });
        return heteroplasmyMap;
    }, [[0]])
    .map((p, i) => { return `${i}; ${Math.max(...p)/p.reduce((a, b) => { return a + b })}` });

data[0] = 'SNP; heteroplasmy';

fs.writeFileSync(`${path}.csv`, data.join('\n'), 'utf-8');

spawn('rscript', [`${__dirname}/heteroplasmy.R`, `${path}.csv`, `${path.replace(/\.sam$/, '')}.png`]);