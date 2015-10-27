'use strict';
var path = require('path');
var babel = require('babel-core');
var fs = require("fs");

module.exports = function (grunt) {
	grunt.registerMultiTask('babel', 'Transpile ES6 to ES5', function () {
		var options = this.options();
		var relay = null;

		if (options.relay) {
			relay = true;
			var getPlugin = require(options.relay.plugin);
			var schema = grunt.file.readJSON(options.relay.schema);
			options.plugins = [getPlugin(schema.data)];
			delete options.relay;
		}

		this.files.forEach(function (el) {
			delete options.filename;
			delete options.filenameRelative;
			var res = null;
			if (relay) {
				var source = fs.readFileSync(el.src[0]);
				res = babel.transform(source, options);
			} else {
				res = babel.transformFileSync(el.src[0], options);
			}

			options.sourceFileName = path.relative(path.dirname(el.dest), el.src[0]);
			if (process.platform === 'win32') {
				options.sourceFileName = options.sourceFileName.replace(/\\/g, '/');
			}
			options.sourceMapTarget = path.basename(el.dest);

			var sourceMappingURL = '';
			if (res.map) {
				sourceMappingURL = '\n//# sourceMappingURL=' + path.basename(el.dest) + '.map';
			}

			grunt.file.write(el.dest, res.code + sourceMappingURL + '\n');

			if (res.map) {
				grunt.file.write(el.dest + '.map', JSON.stringify(res.map));
			}
		});
	});
};