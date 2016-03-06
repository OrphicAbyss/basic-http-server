"use strict";

var http = require("http"),
    https = require("https");

class BasicHTTPServer {
    constructor (options){
        this.port = options.port || "8080";
        this.server = null;
        this.routes = [];
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
        for (let i = 0; i < this.routes.length; i++) {
            if (this.routes[i].testRoute(handler.route)) {
                throw new Error("New route: " + handler.route + " already covered by route: " + this.routes[i].route);
            }
        }

        this.routes.push(handler);
    }

    handleRequest (request, response) {
        const url = request.url;

        let handled = false;
        for (let i = 0; i < this.routes.length; i++) {
            if (this.routes[i].testRoute(url)) {
                this.routes[i].handleRequest(request, response);
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

const BaseRoute = require("./lib/route"),
    StaticFileServer = require("./lib/static");

module.exports = BasicHTTPServer;
module.exports = BaseRoute;
module.exports.StaticFileServer = StaticFileServer;

// const fileHandlerTest = new StaticFileServer("/test", "./", "index.html");
// const fileHandlerTest2 = new StaticFileServer("/test2", "./", "index.html");
// const fileHandler = new StaticFileServer("/", "./", "index.html");
// const httpServer = new BasicHTTPServer({port: 8080});
// httpServer.registerHandler(fileHandlerTest2);
// httpServer.registerHandler(fileHandlerTest);
// httpServer.registerDefaultHandler(fileHandler);
// httpServer.start();
// console.log("HTTP Server has started on port: " + httpServer.port);
//httpServer.stop();