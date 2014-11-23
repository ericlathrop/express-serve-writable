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
		if (req.method !== "PUT") {
			next();
			return;
		}

		var p = path.join(root, req.url);
		var writable = fs.createWriteStream(p);

		req.on("end", function() {
			res.end("ok");
		});

		req.pipe(writable);
	};
};
