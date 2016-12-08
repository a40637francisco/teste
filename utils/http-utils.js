'use strict';

function sendError(rsp, code, message) {
    if (isObject(message)) {
        console.log("object");
        message = JSON.stringify(message);
    }
    console.log(message);
    rsp.status = code;
    rsp.write(message);
    rsp.end();
}


function isObject(obj) {
    return typeof obj !== "string"
}

module.exports = {
    sendError: sendError

}