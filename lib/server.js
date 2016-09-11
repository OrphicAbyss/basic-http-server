"use strict";

const http = require("http");
const https = require("https");

class MicroService {
    constructor (options){
        this.useHttp = options.useHttp !== undefined && options.useHttp !== null ? options.useHttp : true;
        this.useHttps = options.useHttps !== undefined && options.useHttps !== null ? options.useHttps : false;
        this.port = options.port || "8080";
        this.sslPort = options.sslPort || "8081";
        this.httpsOptions = options.httpsOptions || {};
        this.serverHttp = null;
        this.serverHttps = null;
        this.routes = [];
        this.defaultRoute = null;
    }

    start () {
        if (this.useHttp) {
            this.serverHttp = http.createServer(this.handleRequest.bind(this));
            this.serverHttp.listen(this.port);
        }
        if (this.useHttps) {
            this.serverHttps = https.createServer(this.httpsOptions, this.handleRequest.bind(this));
            this.serverHttps.listen(this.sslPort);
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

module.exports = MicroService;