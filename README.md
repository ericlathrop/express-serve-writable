# express-serve-writable

Express middleware for writing to the filesystem with PUT/DELETE requests.

express-serve-writable is the writable complement to [expressjs/serve-static](https://github.com/expressjs/serve-static)'s static file serving.

This will create a web server that will serve up files in a folder, and let you write or delete files inside that same folder:
```javascript
var express = require("express");
var serveStatic = require("serve-static");
var serveWritable = require("express-serve_writable");

var args = process.argv.slice(2);
var root = args[0];

var app = express();
app.use(serveStatic(root));
app.use(serveWritable(root));
app.listen(3000);
```

## Isn't this a security problem?

Yes.

## What's the use-case for this?

I want to build some local development tools for [my HTML5 video games](http://twoscoopgames.com), and since the games are in HTML, the tools should be too. The problem is that the browser isn't allowed to write to the filesystem, and I need to do that.
