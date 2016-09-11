"use strict";

const Server = require("./lib/server");
const Routes = require("./lib/route");
const StaticFileServer = require("./lib/static");

module.exports = {
    MicroService: Server,
    RouteBase: Routes.BaseRoute,
    RouteNull: Routes.BaseRoute,
    RouteJSON: Routes.BaseRoute,
    StaticFileServer: StaticFileServer
};
