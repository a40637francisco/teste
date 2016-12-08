/**
 * Created by Francisco on 04/12/2016.
 */
'use strict';

const https = require("https");

const clientId = "122f8a4441e2c60a84ee";
const clientSecret = "99aed87c2d9d7de3ef1f365e6b7c7af398ea6159";
const baseAuthUri = "https://github.com/login/oauth/authorize";
const redirectUriLogin = "http://localhost:3000/github-login-callback";
const tokenUri = "https://github.com/login/oauth/access_token";

const querystring = require('querystring');

function getRepos(obj, callback) {
    let host = obj.url.slice(8, 22);
    let path = obj.url.slice(22);
    let options = {
        host: host,
        path: path,
        method: 'GET',
        headers: {'user-agent': 'node.js'}
    };
    let cb = function (response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            callback(null, str);
        });
    };
    let req = https.request(options, cb);
    req.end();
}

function getMyRepos(obj, callback) {
    let options = {
        host: "api.github.com",
        path: "/user/repos",
        method: 'GET',
        headers: {
            'user-agent': 'node.js',
            "Authorization": "token " + obj.token,
        }
    };
    let cb = function (response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            callback(null, str);
        });
    };
    let req = https.request(options, cb);
    req.end();

}

function parseRepos(repoArray) {
    let res = {repos: []};
    for (let i = 0; i < repoArray.length; ++i) {
        res.repos[i] = {
            name: repoArray[i]["full_name"],
            description: repoArray[i].description,
            language: repoArray[i].language,
            url: repoArray[i]["issues_url"].replace("{/number}", "")
        }
    }
    return res;
}

function getIssues(obj, cb) {
    let options = {
        host: 'api.github.com',
        path: "/repos/" + obj.username + "/"+ obj.repo + "/issues",
        method: 'GET',
        headers: {
            "Accept": "application/json",
            'user-agent': 'node.js'
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

function getMyIssues(obj, cb) {
    let options = {
        host: 'api.github.com',
        path: "/repos/" + obj.username + "/"+ obj.repo + "/issues",
        method: 'GET',
        headers: {
            "Authorization": "token " + obj.token,
            "Accept": "application/json",
            'user-agent': 'node.js'
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

function parseIssues(issuesArray, repo) {
    let res = {issues: []};
    for (let i = 0; i < issuesArray.length; ++i) {
        res.issues[i] = {
            title: issuesArray[i].title,
            body: issuesArray[i].body,
            state: issuesArray[i].state,
            createdBy: issuesArray[i].user.login,
            repo: repo
        }
    }
    return res;
}

function login(state) {
    let url = baseAuthUri;
    url += "?client_id=" + encodeURIComponent(clientId)
        + "&redirect_uri=" + encodeURIComponent(redirectUriLogin)
        + "&state=" + state
        + "&scope= user:email,repo";
    return url;
}

function getToken(query, cb) {
    let options = {
        host: 'github.com',
        path: '/login/oauth/access_token',
        method: 'POST',
        port: 443,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
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
    let body = querystring.stringify({
        code: query.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUriLogin,
        state: query.state
    });
    req.write(body);
    req.end();
}

function getUser(token, cb) {
    let options = {
        host: 'api.github.com',
        path: '/user',
        method: 'GET',
        headers: {
            "Authorization": "token " + token,
            "Accept": "application/json",
            'user-agent': 'node.js'
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


module.exports = {
    getRepos: getRepos,
    getMyRepos: getMyRepos,
    getMyIssues : getMyIssues,
    getIssues: getIssues,
    parseIssues: parseIssues,
    parseRepos: parseRepos,
    login: login,
    getToken: getToken,
    getUser: getUser
};