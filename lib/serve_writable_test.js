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
			mockFs({ "dir": {} });

			it("should return a middleware", function() {
				assert(typeof serveWritable("/dir") === "function");
			});
		});
	});
	describe("middleware", function() {
		var fs, middleware;

		beforeEach(function() {
			fs = mockFs({ "dir": {} });
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
	return res;
}
