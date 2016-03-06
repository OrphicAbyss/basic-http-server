"use strict";

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

module.exports = Route;
