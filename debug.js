"use strict";

const BasicHTTPServer = require("./index");

// const fileHandlerTest = new StaticFileServer("/test", "./", "index.html");
// const fileHandlerTest2 = new StaticFileServer("/test2", "./", "index.html");
// const fileHandler = new StaticFileServer("/", "./", "index.html");
const httpServer = new BasicHTTPServer({useHttp: true, useHttps: true});
// httpServer.registerHandler(fileHandlerTest2);
// httpServer.registerHandler(fileHandlerTest);
// httpServer.registerDefaultHandler(fileHandler);
httpServer.start();
console.log("HTTP Server has started on port: " + httpServer.port);
console.log("HTTPS Server has started on port: " + httpServer.sslPort);
httpServer.stop((err) => {
    if (err) {
        console.log(err);
    }
    console.log("Done");
});