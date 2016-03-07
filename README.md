# basic-http-server
Basic HTTP server library for Node.js focused on creating simple REST services or Web-apps with minimal dependencies.

## Project Objectives
* Simplify the creating of a HTTP server for static files and web services
* Have minimal project dependencies

## Usage Example

    const fileHandler = new StaticFileServer("/", "./", "index.html");
    const httpServer = new BasicHTTPServer({port: 8080});
    httpServer.registerHandler(fileHandlerTest2);
    httpServer.registerHandler(fileHandlerTest);
    httpServer.registerDefaultHandler(fileHandler);
    httpServer.start();