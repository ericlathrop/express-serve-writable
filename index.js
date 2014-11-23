
var express = require("express");
var serveStatic = require("serve-static");

var args = process.argv.slice(2);
console.log(args[0]);

var app = express();
app.use(serveStatic(args[0]));
app.listen(3000);

