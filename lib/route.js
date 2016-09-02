"use strict";

const zlib = require("zlib");

class Route {
    /**
     * Basic route class to extend
     *
     * @param {String} route
     * @constructor
     */
    constructor (route) {
        this.route = route;
    }

    testRoute (url) {
        return url.startsWith(this.route);
    }
}

class NullRoute extends Route {
    /**
     * Returns 404 for all requests
     */
    constructor (route) {
        super(route);
    }

    handleRequest (request, response) {
        response.statusCode = 404;
        response.write("");
        response.end();
    }
}

class JSONRoute extends Route {
    /**
     * Simple JSON request body handler.
     *
     * Implements handleRequest and treats any body data as JSON,
     * parse errors returned and logged to console.
     *
     * Expects the following method to be implemented:
     *   respond(request, response, data) {};
     *
     * Request is the http request object
     * Response is the http response object
     * Data is the parsed JSON data from the request body
     *
     * @param route
     */
    constructor (route) {
        super(route);
    }

    /**
     * If the headers mark the request as having compressed data then
     * pipe the data through a decompress transform.
     *
     * @param request Request object.
     * @returns {EventEmitter} Event emitter to get data out of
     */
    handleCompressRequest(request) {
        let decompressPipe;

        switch (request.headers["content-encoding"]) {
            case "gzip":
                decompressPipe = zlib.createGunzip();
                request.pipe(decompressPipe);
                return decompressPipe;

            case "deflate":
                decompressPipe = zlib.createInflate();
                request.pipe(decompressPipe);
                return decompressPipe;

            default:
                return request;
        }
    }

    handleRequest (request, response) {
        let data = "";

        const eventObj = this.handleCompressRequest(request);

        eventObj.on("data", (packet) => {
            data += packet;
        });

        eventObj.on("end", () => {
            try {
                const dataObj = JSON.parse(data);
                this.respond(request, response, dataObj);
            } catch (e) {
                console.log("Error parsing JSON data", e);
                this.respondJSON(response, 500, e);
            }
        });
    }

    respond (request, response/*, data*/) {
        response.statusCode = 500;
        response.write("Missing 'respond' method in class '" + this.constructor.name + "'\n");
        response.end();
    }

    respondString (response, status, data) {
        response.statusCode = status;
        response.write(data + "\n");
        response.end();
    }

    respondJSON (response, status, data) {
        response.statusCode = status;
        response.write(JSON.stringify(data) + "\n");
        response.end();
    }
}

module.exports = {
    BaseRoute: Route,
    NullRoute: NullRoute,
    JSONRoute: JSONRoute
};
