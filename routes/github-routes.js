'use strict';

const github = require("../model/github-handler.js");

const tokenMemory = require("../model/token-db.js");

const API_BASE_URL = "https://api.github.com";

module.exports = function (router) {

    router.get("/github-login", function (req, rsp) {
        let state = req.cookies.ss;
        rsp.redirect(github.login(state));
    });

    router.get("/github-login-callback", function (req, rsp) {
        let state = req.cookies.ss;
        if (req.query.state !== state) {
            rsp.status(409);
            rsp.write("Something went wrong, try again later");
            rsp.end();
        }
        github.getToken(req.query, function (err, data) {
            data = JSON.parse(data);
            if (err) {
                httpUtils.sendError(rsp, 500, err);
            } else {
                github.getUser(data["access_token"], function (err, user) {
                    user = JSON.parse(user);
                    if (err) {
                        httpUtils.sendError(rsp, 500, err);
                    } else {
                        tokenMemory.setGitHubToken({state: state, token: data["access_token"], name: user.login});
                        rsp.redirect("/github-my-repos");
                    }
                });

            }
        });
    });

    router.get("/github-repos", function (req, rsp) {
        let repo = req.query.repo;
        let obj = {
            url: API_BASE_URL + "/search/repositories?q=" + repo
        };
        github.getRepos(obj, function (err, data) {
            if (err) {
                httpUtils.sendError(rsp, 500, err);
            } else {
                data = JSON.parse(data);
                if (data["total_count"] === 0) {
                    rsp.redirect("/github-repo-not-found");
                    return;
                }
                let repos = github.parseRepos(data.items);
                rsp.render("repos", repos);
            }
        });
    });

    router.get("/github-my-repos", function (req, rsp) {
        if (!tokenMemory.hasGitHubToken(req.cookies.ss)) {
            rsp.write("not logged in");
            rsp.end();
            return;
        }
        let res = tokenMemory.getGitHub(req.cookies.ss);
        let obj = {token: res.github_token};

        github.getMyRepos(obj, function (err, data) {
            if (err) {
                httpUtils.sendError(rsp, 500, err);
            } else {
                data = JSON.parse(data);
                let repos = github.parseRepos(data);
                rsp.render("repos", repos);
            }
        });

    });

    function loggedIssues(repo, gt, rsp) {
        let obj = {repo: repo.split("/")[1], token: gt.github_token, username: repo.split("/")[0]};
        github.getMyIssues(obj, function (err, data) {
            if (err) {
                httpUtils.sendError(rsp, 500, err);
            } else {
                data = JSON.parse(data);
                let issues = github.parseIssues(data, obj.repo);
                rsp.render("issues", issues);
            }
        });
    }

    function issues(repo, rsp) {
        let obj = {repo: repo.split("/")[1], username: repo.split("/")[0]};
        github.getIssues(obj, function (err, data) {
            if (err) {
                httpUtils.sendError(rsp, 500, err);
            } else {
                data = JSON.parse(data);
                let issues = github.parseIssues(data, obj.repo);
                rsp.render("issues", issues);
            }
        });
    }

    router.get("/github-issues", function (req, rsp) {
        let repo = req.query.repo;
        let state = req.cookies.ss;
        let gt = tokenMemory.getGitHub(state);
        if (gt !== undefined) {
            loggedIssues(repo, gt, rsp);
        } else {
            issues(repo, rsp);
        }
    });

    router.get("/github-repo-not-found", function (req, rsp) {
        rsp.render("repoNotFound");
    });

};