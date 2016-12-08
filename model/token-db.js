/**
 * Created by Francisco on 30/11/2016.
 */
'use strict';

const tokenGetter = require("../utils/id-token-validator.js");
let db = {};


function startSession(state) {
    db[state] = {};
}

//
function setGoogleToken(state, data) {
    data = JSON.parse(data);
    tokenGetter.getVerifiedParsedToken(data["id_token"], function(err, payload){
        db[state].google = {
            google_token: data["access_token"],
            payload: payload
        };
    });


}

function setGitHubToken(obj) {
    if (db[obj.state] === undefined) {
        console.log("something wrong in db, state not present");
    }
    db[obj.state].github = {
        github_token: obj.token,
        username: obj.name
    }
}

function getGoogleToken(state) {
    if(db[state] === undefined || db[state].google === undefined) return undefined;
    return db[state].google.google_token;
}

function getGitHub(state) {
    if (db[state] === undefined) return undefined;
    return db[state].github;
}

function getGitHubToken(state) {
    if (db[state].github === undefined) return undefined;
    return db[state].github.github_token;
}

function hasGitHubToken(state) {
    return getGitHubToken(state) !== undefined;
}

function hasGoogleToken(state) {
    return getGoogleToken(state) !== undefined;
}

function getDb(){
    return db;
}

module.exports = {
    startSession: startSession,
    setGoogleToken: setGoogleToken,
    setGitHubToken: setGitHubToken,
    getGoogleToken: getGoogleToken,
    getGitHub: getGitHub,
    getGitHubToken: getGitHubToken,
    hasGitHubToken: hasGitHubToken,
    hasGoogleToken : hasGoogleToken,
    getDb: getDb
};