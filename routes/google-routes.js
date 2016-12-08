'use strict';

const sessionStateUtils = require("../utils/session-state.js");
const tokenMemory = require("../model/token-db.js");
const google = require('./../model/google-handler.js');

const httpUtils = require("../utils/http-utils.js");

module.exports = function (router) {

    //state session cookie ["ss"]
    router.get("/google-login", function (req, rsp, next) {
        let state = req.cookies.ss;
        if (state === undefined) {
            state = sessionStateUtils.getState();
            rsp.cookie('ss', state);
        }
        tokenMemory.startSession(state);
        rsp.redirect(google.login(state));
    });

    router.get("/google-login-callback", function (req, rsp) {
        let state = req.cookies.ss;
        google.validate({query: req.query, state: state}, function (err, data) {
            if (err) {
                httpUtils.sendError(rsp, 500, err);
            } else {
                google.getAccessToken(data, function (err, data) {
                    if (err) {
                        httpUtils.sendError(rsp, 500, err);
                    } else {
                        tokenMemory.setGoogleToken(state, data);
                        rsp.redirect("/main");
                    }
                });
            }
        });
    });

    router.get("/create-google-task", function (req, rsp) {
        let token = tokenMemory.getGoogleToken(req.cookies.ss);
        let taskObj = {
            title: req.query.title,
            createdBy: req.query.createdBy,
            state: req.query.state,
            notes: req.query.body
        };
        let obj = {token: token, taskList: req.query.repo, task: taskObj};

        google.taskListExists(obj, function (err, data) {
            if (err) {
                httpUtils.sendError(rsp, 500, err);
            } else {
                if (!data.exists) {
                    google.createTaskList(obj, function (err, taskListCreated) {
                        if (err) {
                            httpUtils.sendError(rsp, 500, err);
                        } else {
                            taskListCreated = JSON.parse(taskListCreated);
                            obj.taskList = taskListCreated.id;
                            google.createTask(obj, function (err, data) {
                                if (err) {
                                    httpUtils.sendError(rsp, 500, err);
                                } else {
                                    data = JSON.parse(data);
                                    rsp.redirect("/task?notes=" + data.notes);
                                }
                            });
                        }
                    });
                } else {
                    obj.taskList = data.taskList.id;
                    google.createTask(obj, function (err, data) {
                        if (err) {
                            httpUtils.sendError(rsp, 500, err);
                        } else {
                            data = JSON.parse(data);
                            rsp.redirect("/task?notes=" + data.notes);
                        }
                    });
                }
            }
        });
    });

    router.get("/task", function (req, rsp) {
        let data = {notes: req.query.notes};
        rsp.render("task", data);
    });

};
