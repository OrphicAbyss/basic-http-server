# microservice-base
Microservice base library for Node.js to handle most boiler plate of setting up a microservice.

## Project Objectives
* Base for building a microservice to reduce the boiler plate code in other codebases
* Minimal project dependencies for reducing the chance of a broken build from a broken dependency
* Support for both http and https

## Classes
* __MicroService__ - Main server class
* __RouteBase__ - Base class for routes, expects extending class to implement `handleRequest (request, response)`
* __RouteNull__ - Route that always returns 404. This can be used as the default handler when only sub-routes are required.
* __RouteJSON__ - Simple route which handles JSON parsing of the message body object. Expects extending classes to implement `respond (request, response, data)`
* __StaticFileServer__ - Static file server can be used to serve files from disk

## Usage
The most basic setup has one route which is setup as the default route. The default route handles all
requests which don't match any other route.
1) Create the service
1) Create a route
1) Register the route as the default route
1) Start the server

## Service Options
* __useHttp__ (Default: true) When true a http server is started
* __useHttps__ (Default: false) When true a https server is started
* __port__  (Default: 8080) Set the listening port of the http server (if enabled)
* __sslPort__  (Default: 8081) Set the listening port of the https server (if enabled)
* __httpsOptions__ (Default: {}) Options to pass to the https server (to pass in the key and cert of your server)

## Usage Example

_Create a simple file server:_

    const microBase = require("microservice-base");

    const fileHandler = new microBase.StaticFileServer("/", "./", "index.html");
    const microserver = new microBase.MicroService({port: 8080});
    microserver.registerDefaultHandler(fileHandler);
    microserver.start();

