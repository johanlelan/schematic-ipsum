// Generated by CoffeeScript 1.4.0
(function () {
    var MAX_ARRAY_LENGTH, MAX_NUMBER, MIN_NUMBER, async, clean, data, env, gen, jsv, metaSchema, nonEmpty, uuid, validate, _, pad, RandExp;

    _ = require("./underscoreExt");

    async = require("async");

    jsv = require("JSV").JSV;

    uuid = require("node-uuid");

    data = require("./data");

    pad = require('node-string-pad');

    RandExp = require('randexp');

    MAX_NUMBER = 100;

    MIN_NUMBER = -100;

    MAX_ARRAY_LENGTH = 5;

    nonEmpty = function (strs) {
        return _.filter(strs, function (s) {
            return s && s.trim() !== "";
        });
    };

    clean = function (s) {
        return s != null ? s.trim() : void 0;
    };

    gen = {
        reference: function (done) {
            return done(null, pad(_.randomInt(0, 99999999).toString(), 8, '0'));
        },
        version: function (done) {
            return done(null, _.randomInt(0,9)+'.'+_.randomInt(0,99)+'.'+_.randomInt(0,99));
        },
        mimetype: function (done) {
            return done(null, _.randomFrom(['application/json', 'application/xml', 'application/atom+xml', 'text/csv', 'text/html', 'text/plain']));
        },
        language: function (done) {
            return done(null, _.randomFrom(['en', 'application/xml', 'application/atom+xml', 'text/csv', 'text/html', 'text/plain']));
        },
        year: function (done) {
            return done(null, _.randomInt(1980, 2080));
        },
        paragraphs: function (n, done) {
            return data.paragraphs(function (err, paras) {
                return done(err, _.takeCyclic(nonEmpty(paras), n).join("\n"));
            });
        },
        sentence: function (done, minLength, maxLength) {
            return gen.paragraphs(1, function (err, para) {
                var sentences;
                sentences = nonEmpty(para.match(/[^\.!\?]+[\.!\?]+/g));
                if (_.isEmpty(sentences)) {
                    return gen.sentence(done);
                } else {
                    var str = _.randomFrom(sentences);
                    if (minLength || maxLength) str = str.substr(0, maxLength || minLength);
                    return done(err, clean(str));
                }
            });
        },
        word: function (done) {
            return gen.sentence(function (err, sentence) {
                var word, words;
                words = sentence.split(" ");
                word = _.randomFrom(nonEmpty(words));
                word = word.toLowerCase().replace(/[^a-z\-]/g, "");
                if (word === "") {
                    return gen.word(done);
                } else {
                    return done(err, clean(word));
                }
            });
        },
        name: function (done) {
            return data.names(function (err, names) {
                return done(err, clean(_.randomFrom(names)));
            });
        },
        title: function (done) {
            return data.titles(function (err, titles) {
                return done(err, clean(_.randomFrom(titles)));
            });
        },
        id: function (done) {
            return done(null, uuid.v4());
        },
        image: function (size, done) {
            return done(null, 'http://hhhhold.com/' + size + "?" + _.randomInt(0, 16777215));
        },
        ipsumString: function (schema, done) {
            var genFun;
            genFun = (function () {
                switch (schema.ipsum) {
                    case "reference":
                        return gen.reference;
                    case "mime-type":
                        return gen.mimetype;
                    case "version":
                        return gen.version;
                    case "language":
                        return gen.language;
                    case "id":
                        return gen.id;
                    case "name":
                        return gen.name;
                    case "first name":
                        return function (done) {
                            return gen.name(function (err, name) {
                                return done(err, name.split(' ')[0]);
                            });
                        };
                    case "last name":
                        return function (done) {
                            return gen.name(function (err, name) {
                                return done(err, name.split(' ').slice(1).join(' '));
                            });
                        };
                    case "title":
                        return gen.title;
                    case "word":
                        return gen.word;
                    case "sentence":
                        return gen.sentence;
                    case "paragraph":
                        return function (done) {
                            return gen.paragraphs(1, done);
                        };
                    case "long":
                        return function (done) {
                            return gen.paragraphs(_.randomInt(1, 10), done);
                        };
                    case "small image":
                        return function (done) {
                            return gen.image('s', done);
                        };
                    case "medium image":
                        return function (done) {
                            return gen.image('m', done);
                        };
                    case "large image":
                        return function (done) {
                            return gen.image('l', done);
                        };
                    default:
                        return gen.sentence;
                }
            })();
            return genFun(done, schema.minLength, schema.maxLength);
        },
        formattedString: function (schema, done) {
            var ret, suffix;
            ret = function (s) {
                return done(null, s);
            };
            suffix = function () {
                return _.randomFrom(["com", "org", "net", "edu", "xxx"]);
            };
            switch (schema.format) {
                case "date-time":
                    return ret((new Date(_.randomInt(0, Date.now()))).toISOString());
                case "color":
                    return ret("#" + _.randomInt(0, 16777215).toString(16));
                case "phone":
                    return ret("(" + (_.randomInt(0, 999)) + ") " + (_.randomInt(0, 999)) + " " + (_.randomInt(0, 9999)));
                case "uri":
                    return gen.word(function (err1, word1) {
                        return gen.word(function (err2, word2) {
                            return done(err1 || err2, "http://" + word1 + "." + word2 + "." + (suffix()));
                        });
                    });
                case "email":
                    return gen.name(function (err, name) {
                        return gen.word(function (err2, word) {
                            name = name.toLowerCase().replace(/\s/g, "_");
                            return done(err || err2, "" + name + "@" + word + "." + (suffix()));
                        });
                    });
                default:
                    return ret("String format " + schema.format + " not supported");
            }
        },
        string: function (schema, done) {
            if (schema.format != null) {
                return gen.formattedString(schema, function (err, s) {
                    return done(err, clean(s));
                });
            } else if (schema.pattern && schema.ipsum) {
                return gen.ipsumString(schema, function (err, s) {
                    return done(err, clean(s));
                });
            } else if (schema.pattern) {
                return done(null, new RandExp(schema.pattern).gen());
            } else {
                return gen.ipsumString(schema, function (err, s) {
                    return done(err, clean(s));
                });
            }
        },
        number: function (schema, rand, done) {
            return done(null, rand(MAX_NUMBER, MIN_NUMBER));
        },
        byEnum: function (schema, done) {
            if (!_.isArray(schema["enum"])) {
                done("Value for \"enum\" must be an array.");
            }
            if (_.isEmpty(schema["enum"])) {
                return done("Array for \"enum\" must not be empty.");
            } else {
                return done(null, _.randomFrom(schema["enum"]));
            }
        },
        byRef: function (schema, globalSchema, done) {
            if (!schema.$ref) return done(null, undefined);
            var typeRef = schema.$ref.replace('#/definitions/', '');
            return gen.ipsum(globalSchema.definitions[typeRef], globalSchema, done);
        },
        byType: function (schema, globalSchema, done) {
            var _i, _ref, _results;
            if (!schema.type) return done(null, undefined);
            switch (schema.type) {
                case "boolean":
                    return done(null, Math.random() > 0.5);
                case "number":
                    return gen.number(schema, _.randomNum, done);
                case "integer":
                    return gen.number(schema, _.randomInt, done);
                case "string":
                    return gen.string(schema, done);
                case "object":
                    if (schema.properties) return async.map(_.values(schema.properties), function (prop, callback) {
                        gen.ipsum(prop, globalSchema, callback);
                    }, function (err, ipsumVals) {
                        var obj = _.object(_.keys(schema.properties), ipsumVals);
                        return done(err, obj);
                    });
                    else {
                        return gen.ipsum(schema, globalSchema, done);
                    }
                    break;
                case "array":
                    if (schema.items != null) {
                        return async.map((function () {
                            _results = [];
                            for (var _i = 0, _ref = _.randomInt(0, MAX_ARRAY_LENGTH); 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--) {
                                _results.push(_i);
                            }
                            return _results;
                        }).apply(this), function (i, done) {
                            return gen.ipsum(schema.items, globalSchema, done);
                        }, done);
                    } else {
                        return done(null, []);
                    }
                    break;
                case "any":
                    return done(null, {});
                default:
                    return done("Bad type: \"" + schema.type + "\"");
            }
        },
        ipsum: function (schema, globalSchema, done) {
            if (!schema.enum && !schema.type && !schema.$ref) return done(null, undefined);
            if (schema["enum"] != null) {
                return gen.byEnum(schema, done);
            }
            else if (schema.$ref) return gen.byRef(schema, globalSchema, done);
            else return gen.byType(schema, globalSchema, done);
        },
        ipsums: function (req, res, n, done) {
            var schema = req.body;
            var tab = [];
            // generate n first index
            for (var ind = 0; ind < n - 1; ind++) {
                tab.push(ind);
            }
            res.header('content-type', 'application/json');
            if (n > 1) res.write('[');
            // generate n first objects
            async.mapSeries(tab, function (item, callback) {
                gen.ipsum(schema, schema, function (err, object) {
                    res.write(JSON.stringify(object));
                    if (n > 1) res.write(',');
                    callback();
                });
            }, function (err, items) {
                // generate last object
                gen.ipsum(schema, schema, function (err, object) {
                    res.write(JSON.stringify(object));
                    if (n > 1) res.write(']');
                    done();
                });
            });

        },
        siret: function (done) {
            //On génère le début du numero de siret
            var siret = '';
            var sum = 0;
            for (var i = 0; i != 8; i++) {
                var rand = rand(0, 9);
                siret += rand;
                //On ajoute une fois le résultat si index impair, deux fois sinon
                var tmp = rand * (1 + (i + 1) % 2);
                if (tmp >= 10) tmp -= 9;
                sum += tmp;
            }
            //On ajoute 4 zeros
            siret += "0000";
            //On regarde combien il me manque pour etre congru à 10
            var diff = 10 - (sum % 10);
            if (diff > 2) {
                var first = floor(diff / 3);
                var second = diff - (2 * first);
                siret += first + second;
            } else {
                siret += '0' + diff;
            }

            return done(null, siret.replace("/([0-9]{3})([0-9]{3})([0-9]{3})([0-9]{5})/", "$1 $2 $3 $4"));
        }
    };

    env = jsv.createEnvironment("json-schema-draft-03");

    metaSchema = env.findSchema("http://json-schema.org/draft-03/schema");

    validate = function (schema) {
        var report;
        report = env.validate(schema, metaSchema);
        if (_.isEmpty(report.errors)) {
            return null;
        } else {
            return report.errors;
        }
    };

    module.exports = {
        validate: validate,
        genIpsums: gen.ipsums
    };

}).call(this);