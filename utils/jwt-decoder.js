const base64Url = require("base64-url");

module.exports = {
    decodeJwt: function (token) {

        var segments = token.split('.');

        if (segments.length !== 3) {
            throw new Error('Not enough or too many segments');
        }

        // All segment should be base64
        var headerSeg = segments[0];
        var payloadSeg = segments[1];
        var signatureSeg = segments[2];

        // base64 decode and parse JSON
        var header = JSON.parse(base64Url.decode(headerSeg));
        var payload = JSON.parse(base64Url.decode(payloadSeg));

        return {
            header: header,
            payload: payload,
            signature: signatureSeg
        }

    }
};
