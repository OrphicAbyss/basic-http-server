"use strict";

var http = require("http"),
    https = require("https");

class BasicHTTPServer {
    constructor (options){
        this.useHttp = options.useHttp !== undefined && options.useHttp !== null ? options.useHttp : true;
        this.useHttps = options.useHttps !== undefined && options.useHttps !== null ? options.useHttps : false;
        this.port = options.port || "8080";
        this.sslPort = options.sslPort || "8081";
        this.httpOptions = options.httpOptions || {};
        this.httpsOptions = options.httpsOptions || {};
        this.serverHttp = null;
        this.serverHttps = null;
        this.routes = [];
        this.defaultRoute = null;
    }

    start () {
        if (this.useHttp) {
            this.serverHttp = http.createServer(this.httpOptions, this.handleRequest.bind(this));
            this.serverHttp.listen(this.port);
        }
        if (this.useHttps) {
            this.serverHttps = https.createServer(this.httpsOptions, this.handleRequest.bind(this));
            this.serverHttps.listen(this.port);
        }
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
    
    getRawHttpServer () {
        return this.serverHttp;
    }

    getRawHttpsServer () {
        return this.serverHttps;
    }

    stop (callback) {
        if (this.serverHttp) {
            this.stopHttp((err) => {
                if (this.serverHttps) {
                    this.stopHttps((err2) => {
                        callback(err || err2);
                    });
                } else {
                    callback(err, null);
                }
            });
        } else if (this.serverHttps) {
            this.stopHttps(callback);
        } else {
            callback();
        }
    }

    stopHttp (callback) {
        this.serverHttp.close((err) => {
            this.serverHttp = null;
            if (callback) {
                callback(err, null);
            }
        });
    }

    stopHttps (callback) {
        this.serverHttps.close((err) => {
            this.serverHttps = null;
            if (callback) {
                callback(err, null);
            }
        });
    }
}

const Routes = require("./lib/route"),
    StaticFileServer = require("./lib/static");

module.exports = BasicHTTPServer;
module.exports.BaseRoute = Routes.BaseRoute;
module.exports.NullRoute = Routes.NullRoute;
module.exports.JSONRoute = Routes.JSONRoute;
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