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

    /**
     * Start the http and/or https server
     */
    start () {
        if (this.useHttp) {
            this.serverHttp = http.createServer(this._handleRequest.bind(this));
            this.serverHttp.listen(this.port);
        }
        if (this.useHttps) {
            this.serverHttps = https.createServer(this.httpsOptions, this._handleRequest.bind(this));
            this.serverHttps.listen(this.sslPort);
        }
    }

    /**
     * Register a default request handler which will handle requests when no other routes match.
     *
     * @param {Route} handler
     */
    registerDefaultHandler (handler) {
        this.defaultRoute = handler;
    }

    /**
     * Register a request handler which will handle requests for a specific route
     *
     * @param {Route} handler
     */
    registerHandler (handler) {
        for (let i = 0; i < this.routes.length; i++) {
            if (this.routes[i].testRoute(handler.route)) {
                throw new Error("New route: " + handler.route + " already covered by route: " + this.routes[i].route);
            }
        }

        this.routes.push(handler);
    }

    /**
     * Internal request handler which tests the incoming url against the registered handlers.
     *
     * @param request
     * @param response
     * @private
     */
    _handleRequest (request, response) {
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

    /**
     * Returns the http server (if created)
     *
     * @returns {Server|null}
     */
    getRawHttpServer () {
        return this.serverHttp;
    }

    /**
     * Returns the https server (if created)
     *
     * @returns {Server|null}
     */
    getRawHttpsServer () {
        return this.serverHttps;
    }

    /**
     * Shutdown the server and wait for last connections to close. Callback called once shutdown complete.
     *
     * @param callback
     */
    stop (callback) {
        // Number of expected calls to done (1 = no servers, 2 = one server, 3 = two servers)
        const servers = (this.serverHttp ? 1 : 0) + (this.serverHttps ? 1 : 0) + 1;
        // Calls to done
        let closed = 0;
        const errs = [];

        const done = function (err) {
            closed += 1;

            if (err) {
                errs.push(err);
            }

            if (closed >= servers) {
                if (err.length > 0) {
                    callback(errs);
                } else {
                    callback();
                }

            }
        };

        if (this.serverHttp) {
            this._stopHttp(done);
        }

        if (this.serverHttps) {
            this._stopHttps(done);
        }

        // Call in case no servers are open
        done();
    }

    /**
     * Called to close the http server if open
     *
     * @param {function} callback
     * @private
     */
    _stopHttp (callback) {
        this.serverHttp.close((err) => {
            this.serverHttp = null;
            if (callback) {
                callback(err, null);
            }
        });
    }

    /**
     * Called to close the https server if open
     *
     * @param {function} callback
     * @private
     */
    _stopHttps (callback) {
        this.serverHttps.close((err) => {
            this.serverHttps = null;
            if (callback) {
                callback(err, null);
            }
        });
    }
}

module.exports = MicroService;