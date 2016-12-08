'use strict';

const clientId = "290896596954-c59g7jvmsno0ril3p2tkgtp23vct8lcj.apps.googleusercontent.com";
const authorizationUrlBase = "https://accounts.google.com/o/oauth2/v2/auth";
const redirectUriLogin = "http://localhost:3000/google-login-callback";
const redirectUriLoginSuccessful = "http://localhost/home";

const querystring = require('querystring');

const scopeTasks = "https://www.googleapis.com/auth/tasks";

const clientSecret = "LmlOG_Cm9DfoT119Lw7WEU-k";

let http = require('https');

function validate(obj, cb) {
    if (obj.query.error) {
        cb({canceled:""});
    }
    else if(obj.query.state !== obj.state){
        cb({status:401, message: "Invalid state parameter"});
    }
    else {
        cb(null, obj.query.code);
    }

}

function getAccessToken(data, cb) {
    let http = require('https');
    let options = {
        host: 'www.googleapis.com',
        path: '/oauth2/v4/token',
        method: 'POST',
        port: 443,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
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
    let req = http.request(options, callback);
    let body = querystring.stringify({
        code: data,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUriLogin,
        grant_type: "authorization_code"
    });
    req.write(body);
    req.end();
}

function login(state) {
    let url = authorizationUrlBase;
    url += "?response_type=code"
        + "&redirect_uri=" + encodeURIComponent(redirectUriLogin)
        + "&client_id=" + encodeURIComponent(clientId)
        + "&state=" + state
        + "&scope=openid https://www.googleapis.com/auth/tasks"; //testar com este scope
    //console.log(url);
    return url;
}

function tasksAuth() {
    let url = authorizationUrlBase;
    url += "?response_type=token"
        + "&redirect_uri=" + encodeURIComponent(redirectUriLogin)
        + "&client_id=" + encodeURIComponent(clientId)
        + "&scope=" + encodeURIComponent(scopeTasks);
    //console.log(url);
    return url;
}

function taskListExists(obj, cb) {
    getTaskList(obj, function(err, data){
        if(err){
            cb(err);
        } else {
            data = JSON.parse(data);
            let res = {exists: false, taskList:{}};
            for(let i=0; i < data.items.length; ++i) {
                if(data.items[i].title == obj.taskList){
                    res.exists = true;
                    res.taskList = data.items[i];
                    break;
                }
            }
            cb(null, res);
        }
    });
}

function createTaskList(obj, cb) {
    let options = {
        host: 'www.googleapis.com',
        path: '/tasks/v1/users/@me/lists',
        method: 'POST',
        port: 443,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "OAuth " + obj.token
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
    let req = http.request(options, callback);
    let body = {
        title: obj.taskList
    };
    req.write(JSON.stringify(body));
    req.end();
}

function getTaskList(obj, cb) {
    let options = {
        host: 'www.googleapis.com',
        path: "/tasks/v1/users/@me/lists",
        method: 'GET',
        port: 443,
        headers: {
            "Authorization": "OAuth " + obj.token
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
    let req = http.request(options, callback);
    req.end();
}

function createTask(obj, cb) {
    let options = {
        host: 'www.googleapis.com',
        path: "/tasks/v1/lists/"+ obj.taskList +"/tasks",
        method: 'POST',
        port: 443,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "OAuth " + obj.token
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
    let req = http.request(options, callback);
    let body = {
        title: obj.task.title,
        notes: JSON.stringify(obj.task)
    };
    req.write(JSON.stringify(body));
    req.end();
}


module.exports = {
    login: login,
    tasksAuth: tasksAuth,
    validate: validate,
    getAccessToken: getAccessToken,
    taskListExists: taskListExists,
    createTaskList: createTaskList,
    createTask: createTask,
    getClientId: clientId
};
