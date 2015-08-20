var config = require('config');
var nock = require('nock');
var should = require('should');
var winston = require('winston');

require('../src/server');
var port = config.port;

var host = "http://localhost" + (port ? ':'+port : '');

describe('api', function() {
    describe(host, function () {
        describe('/schema/ipsum', function () {
            var should = require("should");
            var request = require("request");
            var _ = require("underscore");
            var jsv = require("JSV").JSV;
            var env = jsv.createEnvironment("json-schema-draft-03");
            var validate = function (schema, data) {
                var report = env.validate(data, schema);
                if (_.isEmpty(report.errors)) return null;
                console.error(report.errors);
                return new Error(report.errors);
            };

            testSchema = function (title, schema, check) {
                return it("" + title, function (done) {
                    return request.post({uri: host, json: schema}, function (err, res) {
                        should.exist(res.body);
                        err = validate(schema, res.body);
                        if (check != null) check(res.body);
                        return done(err);
                    });
                });
            };

            describe("primitive:", function () {
                testSchema("string", {
                    type: "string"
                });
                testSchema("number", {
                    type: "number"
                });
                testSchema("integer", {
                    type: "integer"
                });
                return testSchema("boolean", {
                    type: "boolean"
                });
            });

            describe("object:", function () {
                testSchema("empty", {
                    type: "object",
                    properties: {}
                });
                testSchema("age", {
                    type: "object",
                    properties: {
                        age: {
                            type: "number"
                        }
                    }
                });
                return testSchema("age, alive", {
                    type: "object",
                    properties: {
                        age: {
                            type: "number"
                        },
                        alive: {
                            type: "boolean"
                        }
                    }
                });
            });

            describe("array:", function () {
                return testSchema("number", {
                    type: "array",
                    items: {
                        type: "number"
                    }
                });
            });

            describe("nested:", function () {
                testSchema("array of objects", {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            count: {
                                type: "number"
                            }
                        }
                    }
                });
                return testSchema("object with array", {
                    type: "object",
                    properties: {
                        count: {
                            type: "number"
                        },
                        comments: {
                            type: "array",
                            items: {
                                type: "boolean"
                            }
                        }
                    }
                });
            });

            describe("string format:", function () {
                var testFmt;
                testFmt = function (f) {
                    return testSchema(f, {
                        type: "string",
                        format: f
                    });
                };
                testFmt("date-time");
                testFmt("color");
                testFmt("phone");
                testFmt("uri");
                return testFmt("email");
            });

            describe("string ipsum:", function () {
                var testIpsum;
                testIpsum = function (i) {
                    return testSchema(i, {
                        type: "string",
                        ipsum: i
                    });
                };
                testIpsum("id");
                testIpsum("name");
                testIpsum("first name");
                testIpsum("last name");
                testIpsum("title");
                testIpsum("word");
                testIpsum("sentence");
                testIpsum("paragraph");
                testIpsum("long");
                testIpsum("small image");
                testIpsum("medium image");
                return testIpsum("large image");
            });

            describe("multiple:", function () {
                return it("5 bools", function (done) {
                    return request.post({
                        uri: host + "?n=5", json: {
                            type: "boolean"
                        }
                    }, function (err, res) {
                        should.exist(res.body);
                        res.body.should.be.an.instanceOf(Array);
                        res.body.should.have.length(5);
                        return done();
                    });
                });
            });

            describe("enum:", function () {
                testSchema("singleton", {
                    "enum": [1]
                }, function (res) {
                    return res === 1;
                });
                return testSchema("strings", {
                    type: "string",
                    "enum": ["a", "b"]
                }, function (res) {
                    return res === "a" || res === "b";
                });
            });

            it("should accept type any", function (done) {
                return request.post({
                    uri: host, json: {
                        type: "any"
                    }
                }, function (err, res) {
                    res.statusCode.should.equal(200);
                    _.isEmpty(res.body).should.be.true;
                    done();
                });
            });

            it("should accept type array without items", function (done) {
                return request.post({
                    uri: host, json: {
                        type: "array"
                    }
                }, function (err, res) {
                    res.statusCode.should.equal(200);
                    res.body.should.be.an.array;
                    done();
                });
            });

            describe("errors:", function () {
                it("should error if not given a schema", function (done) {
                    return request.post({uri: host, json: null}, function (err, res) {
                        res.statusCode.should.equal(400);
                        done();
                    });
                });
                it("should error if given an empty schema", function (done) {
                    return request.post({uri: host, json: {}}, function (err, res) {
                        res.statusCode.should.equal(400);
                        done();
                    });
                });
                return it("should error if given an invalid schema", function (done) {
                    return request.post({
                        uri: host, json: {
                            type: 0
                        }
                    }, function (err, res) {
                        res.statusCode.should.equal(400);
                        done();
                    });
                });
            });

        });
    });
});