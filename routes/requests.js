/**
 * Created by Francisco on 29/11/2016.
 */
'use strict';

const router = require('express').Router();

const tokenMemory = require("../model/token-db.js");

//Passing the router obj, so that they add routes to it
const googleRoutes = require("./google-routes")(router);
const githubRoutes = require("./github-routes")(router);

router.get("/",function(req, rsp, next) {
    let state = req.cookies.ss;
    if(state !== undefined)
        if(tokenMemory.hasGoogleToken(state)) {
            console.log("redirect to main");
            rsp.redirect("/main");
            return;
        }
    rsp.render('index');
});


router.get("/main", function(req, rsp){
    let obj = {};
    let v = tokenMemory.hasGitHubToken(req.cookies.ss);
    obj = v? {}:{github:"show"};
    rsp.render('main', obj);
});


module.exports = router;







