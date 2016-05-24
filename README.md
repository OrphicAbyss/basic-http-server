# basic-http-server
Basic HTTP server library for Node.js focused on creating simple REST services or Web-apps with minimal dependencies.

## Project Objectives
* Simplify the creating of a HTTP server for static files and web services
* Have minimal project dependencies

## Classes
* __BasicHTTPServer__ - Main server class
* __BaseRoute__ - Base class for routes, expects extending class to implement `handleRequest (request, response)`
* __NullRoute__ - Route that always returns 404. This can be used as the default handler when only sub-routes are required.
* __JSONRoute__ - Simple route which handles JSON parsing of the message body object. Expects extending classes to implement `respond (request, response, data)`

## Usage Example

    const BasicHTTPServer = require("basic-http-server");

    const fileHandler = new BasicHTTPServer.StaticFileServer("/", "./", "index.html");
    const httpServer = new BasicHTTPServer({port: 8080});
    httpServer.registerDefaultHandler(fileHandler);
    httpServer.start();
