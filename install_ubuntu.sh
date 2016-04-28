#!/usr/bin/env bash

# Скрипт предназначен для разворачивания всей инфраструктуры приложения на DigitalOcean-подобном сервере с Debian/Ubuntu
# Для установки нужно просто запустить этот скрипт (он сам склонирует репозиторий с гитхаба)
# Для запуска нужно проверить конфиг (mtstone.js -> config) и запустить forever mtstone.js

# 1) Run redis-server as a daemon
# 2) Make initial configuration (rscript -> Rscript; ts -> tsp; host -> ask for host adds)

SOFTWARE='/usr/bin'
mkdir -p ${SOFTWARE}

apt-get update
apt-get install -y wget unzip git nano task-spooler r-base

# BWA
    cd ${SOFTWARE}; \
    git clone https://github.com/lh3/bwa.git; \
    cd bwa; \
    make; \
    ln -s ${SOFTWARE}/bwa/bwa  /usr/local/bin

# Node.js
    NODE_VERSION='v6.0.0'
    cd ${SOFTWARE}; \
    wget https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz; \
    apt-get install xz-utils; \
    tar -xf node-${NODE_VERSION}-linux-x64.tar.xz; \
    rm node-${NODE_VERSION}-linux-x64.tar.xz; \
    ln -s ${SOFTWARE}/node-${NODE_VERSION}-linux-x64/bin/node  /usr/local/bin
    ln -s ${SOFTWARE}/node-${NODE_VERSION}-linux-x64/bin/npm  /usr/local/bin

# REDIS
    REDIS='redis-3.0.7'
    apt-get install -y make gcc; \
    cd ${SOFTWARE}; \
    wget http://download.redis.io/releases/${REDIS}.tar.gz; \
    tar -xzf ${REDIS}.tar.gz; \
    rm ${REDIS}.tar.gz; \
    cd ${REDIS}/deps; \
    make hiredis lua jemalloc linenoise; \
    cd ..; \
    make; \
    make install; \
    sed -i.bak 's/daemonize no/daemonize yes/g' redis.conf; \
    redis-server redis.conf

# mtStone
    mkdir -p /var/www; \
    cd /var/www; \
    git clone https://github.com/stasundr/mtstone.git; \
    cd mtstone; \
    npm install