'use strict';

const crypto = require("crypto");

let db = {};

function getState() {
    //120 bytes == 30 chars
    let id = crypto.randomBytes(120).toString('hex');
    db[id] = 1;
    return id;
}

function isPresent(entry) {
    return db[entry] !== undefined;
}

module.exports = {
    getState: getState,
    isPresent: isPresent
};