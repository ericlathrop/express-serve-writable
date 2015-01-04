"use strict";

var fs = require("fs");
var path = require("path");

module.exports = function(root) {
	if (!root) {
		throw new TypeError("root is required");
	}
	if (!fs.existsSync(root)) {
		throw new TypeError("root does not exist");
	}

	return function(req, res, next) {
		if (req.method !== "PUT" && req.method !== "DELETE") {
			next();
			return;
		}

		var p = path.normalize(path.join(root, req.url));
		if (p.indexOf(root) !== 0) {
			res.statusCode = 403;
			res.setHeader("Content-Type", "text/plain");
			res.end("403 forbidden");
			return;
		}

		if (req.method === "DELETE") {
			deleteFile(res, p);
			return;
		}

		writeFile(req, res, p);
	};
};

function deleteFile(res, path) {
	fs.unlink(path, function(err) {
		if (err) {
			res.statusCode = 404;
			res.setHeader("Content-Type", "text/plain");
		} else {
			res.statusCode = 204;
		}
		res.end();
	});
}

function writeFile(req, res, path) {
	var createWriteStream = fs.createWriteStream.bind(fs);
	var writable = createWriteStream(path);

	req.on("end", function() {
		res.statusCode = 201;
		res.setHeader("Content-Type", "text/plain");
		res.end("201 created");
	});

	req.pipe(writable);
}
