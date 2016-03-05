"use strict";

var url = require("url"),
    fs = require("fs"),
    path = require("path");

class StaticFileServer {
    /**
     *
     * @param {String} route
     * @param {String} rootPath
     * @param {String} defaultFilename
     * @constructor
     */
    constructor (route, rootPath, defaultFilename) {
        this.route = route;
        this.rootPath = rootPath;
        this.defaultFilename = defaultFilename;
    }

    /**
     * Calculate the file path & name based on a webserver route
     *
     * @param {String} path Path provided to webserver
     * @return {String} Path of file to serve
     */
    calculateFilename (path) {
        if (path.startsWith(this.route)) {
            var newPath = path.substring(this.route.length);
            return this.rootPath + newPath;
        } else {
            console.error("Invalid route path sent to static file server. Path:", path, " Expected start:", this.route);
        }
    }

    /**
     * Return the name of the content type to send in the response heaeder.
     *
     * @param {String} filePath Filepath of the file which we will get the extension from
     * @return {String} Content type string
     */
    getContentType (filePath) {
        var content = "text/html";

        var ext = path.extname(filePath);
        switch (ext) {
            case ".js":
                content = "text/javascript";
                break;
            case ".css":
                content = "text/css";
                break;
            default:
                content = "text/html";
        }

        return content;
    }

    serveFile (filePath, contentType, response) {
        try {
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                console.log("Responsed with 200");
                var fileStream = fs.createReadStream(filePath);
                response.writeHead(200, {"Content-Type": contentType});
                fileStream.pipe(response);
            } else {
                console.log("Responsed with 404");
                response.writeHead(404);
                response.end();
            }
        } catch (e) {
            console.log(e);
            response.writeHead(404);
            response.end();
        }
    }

    handleRequest (request, response) {
        var pathname = request.url;

        console.log("Request for " + pathname + " received.");

        if (pathname === "/") {
            pathname = "/" + this.defaultFilename;
        }

        const parsed = url.parse(pathname);
        const filePath = this.calculateFilename(parsed.pathname);

        console.log("Got: " + pathname + " parsed to: " + parsed.pathname + " to file: " + filePath);

        const content = this.getContentType(filePath);

        this.serveFile(filePath, content, response);
    }
}

module.exports = StaticFileServer;