var express = require("express");
var serveStatic = require("serve-static");
var serveWritable = require("./lib/serve_writable");

var args = process.argv.slice(2);

var app = express();
app.use(serveStatic(args[0]));
app.use(serveWritable(args[0]));
app.listen(3000);
