"use strict";

var http = require("http"),
    https = require("https");

const StaticFileServer = require("./lib/static");

class BasicHTTPServer {
    constructor (options){
        this.port = options.port || "8080";
        this.server = null;
        this.routes = {};
        this.defaultRoute = null;
    }

    start () {
        this.server = http.createServer(this.handleRequest.bind(this));
        this.server.listen(this.port);
    }

    registerDefaultHandler (handler) {
        this.defaultRoute = handler;
    }

    registerHandler (handler) {
        if (handler.route in this.routes) {
            throw new Error("Setup route already contain route: " + handler.route);
        }

        this.routes[handler.route] = handler;
    }

    handleRequest (request, response) {
        const url = request.url;

        let handled = false;
        for (let route in this.routes) {
            if (url.startsWith(route)) {
                this.routes[route].handleRequest(request, response);
                handled = true;
                break;
            }
        }

        if (!handled) {
            this.defaultRoute.handleRequest(request, response);
        }
    }
    
    getRawServer () {
        return this.server;
    }

    stop (callback) {
        this.server.close((err) => {
            this.server = null;
            if (callback) {
                callback(err, null);
            }
        });
    }
}

module.exports = BasicHTTPServer;

const fileHandler = new StaticFileServer("/", "./", "index.html");
const httpServer = new BasicHTTPServer({port: 8080});
httpServer.registerDefaultHandler(fileHandler);
httpServer.start();
console.log("HTTP Server has started on port: " + httpServer.port);
//httpServer.stop();