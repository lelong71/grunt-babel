'use strict';
var path = require('path');
var babel = require('babel-core');
var fs = require("fs");
var getBabelRelayPlugin = require('babel-relay-plugin');

module.exports = function (grunt) {
	var schemaData = grunt.file.readJSON('./schema.json');
	var plugin = getBabelRelayPlugin(schemaData.data);
	grunt.registerMultiTask('babel', 'Transpile ES6 to ES5', function () {
		var options = this.options();

		this.files.forEach(function (el) {
			delete options.filename;
			delete options.filenameRelative;

			options.sourceFileName = path.relative(path.dirname(el.dest), el.src[0]);
			if (process.platform === 'win32') {
				options.sourceFileName = options.sourceFileName.replace(/\\/g, '/');
			}
			options.sourceMapTarget = path.basename(el.dest);
			options.plugins = [plugin];
			var source = fs.readFileSync(el.src[0]);
			var res = babel.transform(source, options);

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