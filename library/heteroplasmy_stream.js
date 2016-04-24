#! /usr/bin/env node
'use strict';

let fs = require('fs');
let split = require('split');
let spawn = require('child_process').spawn;

let heteroplasmy = [];
for (let i = 1; i < 17000; i++) {
    heteroplasmy.push({ A: 0, C: 0, G: 0, T: 0, N: 0 });
}

let path = process.argv[2];
let stream = fs
    .createReadStream(path, 'utf8')
    .pipe(split());

stream.on('data', line => {
    // 3rd column - read position
    // 9th column - read sequence
    let columns = line.split('\t');
    if (columns.length > 9) {
        for (let i = 0; i < columns[9].length; i++) {
            heteroplasmy[i + parseInt(columns[3])][columns[9][i]]++;
        }
    }
});

stream.on('end', () => {
    fs.writeFileSync(
        `${path}.csv`,
        'SNP; heteroplasmy\n' +
        heteroplasmy
            .map((p, i) => (p.A + p.C + p.G + p.T) ? `${i}; ${Math.max(p.A, p.C, p.G, p.T)/(p.A + p.C + p.G + p.T)}` : '')
            .filter(s => s !== '')
            .join('\n'),
        'utf8');

    spawn('rscript', [`${__dirname}/heteroplasmy.R`, `${path}.csv`, `${path.replace(/\.sam$/, '')}.png`]);
});