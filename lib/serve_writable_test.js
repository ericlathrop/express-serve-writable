var assert = require("assert");
var serveWritable = require("./serve_writable");

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
				assert(typeof serveWritable("testdir") === "function");
			});
		});
	});
});
