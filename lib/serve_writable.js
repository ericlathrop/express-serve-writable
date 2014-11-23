var fs = require("fs");

module.exports = function(root) {
	if (!root) {
		throw new TypeError("root is required");
	}
	if (!fs.existsSync(root)) {
		throw new TypeError("root does not exist");
	}

	return function(req, res, next) {};
};
