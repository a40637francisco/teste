'use strict';

const jwtDecoder = require("./jwt-decoder");

const https = require("https");

const google = require("../model/google-handler.js")

function getToken(token, cb) {
    let jwt = jwtDecoder.decodeJwt(token);
    //console.log(jwt);
    verifyHeader(jwt.header, function (err, data) {
        if (err) {
            cb({});
        } else {
            verifyPayload(jwt.payload, function(err, data){

                cb(null, jwt.payload);
            });



        }
    });
}

function verifyHeader(header, cb) {
    //header.alg, header.kid
    getDiscoveryDocument(function (err, data) {
        data = JSON.parse(data);
        getCerts(data["jwks_uri"], function (err, data) {
            data = JSON.parse(data);
            for (let i = 0; i < data["keys"].length; ++i) {
                let j = data["keys"][i];
                if (j.alg === header.alg && j.kid === header.kid) {
                    cb(null,{});
                    return;
                }
            }
            cb({});
        });
    });
}

function getDiscoveryDocument(cb) {
    let options = {
        host: 'accounts.google.com',
        path: '/.well-known/openid-configuration',
        method: 'GET',
        port: 443,
        headers: {
            "Content-Type": "application/json"
        }
    };
    let callback = function (response) {
        var str = ''
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            cb(null, str);
        });
    };
    let req = https.request(options, callback);
    req.end();
}

function getCerts(uri, cb) {
    //https://www.googleapis.com/oauth2/v3/certs
    let options = {
        host: uri.split("/")[2],
        path: uri.split("com")[1],
        method: 'GET',
        port: 443,
        headers: {
            "Content-Type": "application/json"
        }
    };
    let callback = function (response) {
        var str = ''
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            cb(null, str);
        });
    };
    let req = https.request(options, callback);
    req.end();
}

function verifyPayload(payload, cb) {
    if(payload["iss"] !== 'https://accounts.google.com') {
        cb({});
        return;
    }
    if(payload["aud"] !== google.clientId ) {
        cb({});
        return;
    }
    if(hasTimePassed(payload)) {
        cb({});
        return;
    }
    cb(null,{});
}

function hasTimePassed(payload) {
    let curTimeInSeconds = new Date().getTime() / 1000;

    return (curTimeInSeconds - payload["iat"] >= playload["time"]);
}


module.exports = {

    getVerifiedParsedToken: getToken
};
