"use strict";

var assert = require("assert");
var FS = require("fs-mock");
var rewire = require("rewire");
var stream = require("stream");

var serveWritable = rewire("./serve_writable");

function mockFs(structure) {
	var fs = new FS(structure);
	serveWritable.__set__("fs", fs);
	return fs;
}

describe("serveWritable", function() {
	describe("with no root", function() {
		it("should explode", function() {
			assert.throws(serveWritable, TypeError);
		});
	});
	describe("with root", function() {
		describe("that doesnt exist", function() {
			it("should explode", function() {
				assert.throws(function() {
					serveWritable("/doesnotexist");
				}, TypeError);
			});
		});
		describe("that does exist", function() {
			it("should return a middleware", function() {
				mockFs({ "dir": {} });
				assert(typeof serveWritable("/dir") === "function");
			});
		});
	});
	describe("middleware", function() {
		var fs, middleware;

		beforeEach(function() {
			fs = mockFs({
				"dir": {
					"todelete": "stuff"
				}
			});
			middleware = serveWritable("/dir");
		});

		describe("with GET request", function() {
			it("should call next", function(done) {
				var req = { method: "GET" };
				var res = {};
				middleware(req, res, done);
			});
		});
		describe("with PUT request", function() {
			it("should write the file", function(done) {
				var req = mockRequest("PUT", "/file", "hello");

				var res = mockResponse();
				res.on("finish", function() {
					assert.equal("hello", fs.readFileSync("/dir/file", { encoding: "utf8" }));
					done();
				});

				middleware(req, res);
			});
			it("should return 201 created", function(done) {
				var req = mockRequest("PUT", "/file", "hello");

				var res = mockResponse();
				res.on("finish", function() {
					assert.equal(201, res.statusCode);
					done();
				});

				middleware(req, res);
			});
			it("should return text/plain mime type", function(done) {
				var req = mockRequest("PUT", "/file", "hello");

				var res = mockResponse();
				res.on("finish", function() {
					assert.equal("text/plain", res.getHeader("Content-Type"));
					done();
				});

				middleware(req, res);
			});
			describe("with path above root", function() {
				it("should return 403 forbidden", function(done) {
					var req = mockRequest("PUT", "/../file", "hello");

					var res = mockResponse();
					res.on("finish", function() {
						assert.equal(403, res.statusCode);
						done();
					});

					middleware(req, res);
				});
				it("should return text/plain mime type", function(done) {
					var req = mockRequest("PUT", "/../file", "hello");

					var res = mockResponse();
					res.on("finish", function() {
						assert.equal("text/plain", res.getHeader("Content-Type"));
						done();
					});

					middleware(req, res);
				});
				it("should not write the file", function(done) {
					var req = mockRequest("PUT", "/../file", "hello");

					var res = mockResponse();
					res.on("finish", function() {
						assert.equal(false, fs.existsSync("/file"));
						done();
					});

					middleware(req, res);
				});
			});
		});
		describe("with DELETE request", function() {
			describe("with existing file", function() {
				it("should delete the file", function(done) {
					var req = mockRequest("DELETE", "/todelete", null);

					var res = mockResponse();
					res.on("finish", function() {
						assert.equal(false, fs.existsSync("/dir/todelete"));
						done();
					});

					middleware(req, res);
				});
				it("should return 204 no content", function(done) {
					var req = mockRequest("DELETE", "/todelete", null);

					var res = mockResponse();
					res.on("finish", function() {
						assert.equal(204, res.statusCode);
						done();
					});

					middleware(req, res);
				});
			});
			describe("with non-existing file", function() {
				it("should return 404 not found", function(done) {
					var req = mockRequest("DELETE", "/doesnotexist", null);

					var res = mockResponse();
					res.on("finish", function() {
						assert.equal(404, res.statusCode);
						done();
					});

					middleware(req, res);
				});
				it("should return text/plain mime type", function(done) {
					var req = mockRequest("DELETE", "/doesnotexist", null);

					var res = mockResponse();
					res.on("finish", function() {
						assert.equal("text/plain", res.getHeader("Content-Type"));
						done();
					});

					middleware(req, res);
				});
			});
		});
	});
});

function mockRequest(method, url, data) {
	var req = stream.Readable();
	req._read = function() {
		req.push(data);
		req.push(null);
	};
	req.method = method;
	req.url = url;
	return req;
}

function mockResponse() {
	var res = stream.Writable();
	res._write = function(chunk, encoding, callback) { // jshint ignore:line
		callback();
	};
	res.headers = {};
	res.setHeader = function(name, value) {
		res.headers[name] = value;
	};
	res.getHeader = function(name) {
		return res.headers[name];
	};
	return res;
}
