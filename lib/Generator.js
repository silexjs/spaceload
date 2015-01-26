var pa = require('path');
var fs = require('fs');
var glob = require('glob');


var Generator = function() {};
Generator.prototype = {
	analyser: function(dir, test) {
		var dir = pa.resolve(dir || '');
		var test = test || false;
		var autoload = {};
		var packages = glob.sync(dir+'/**/node_modules/*/package.json');
		for(i in packages) {
			if(test !== true && packages[i].search('node_modules/spaceload/test/node_modules/') !== -1) {
				continue;
			}
			var pack = require(packages[i]);
			if(pack['autoload'] !== undefined) {
				for(type in pack['autoload']) {
					if(autoload[type] === undefined) {
						autoload[type] = {};
					}
					for(ns in pack['autoload'][type]) {
						var nsClean = ns.replace(/(\.|\s+|\\|\/)/g, '\\');
						var level = nsClean.split('\\').length;
						if(autoload[type][level] === undefined) {
							autoload[type][level] = {};
						}
						autoload[type][level][nsClean] = pa.join(pa.dirname(packages[i]), pack['autoload'][type][ns]);
					}
				}
			}
		}
		var finalAutoload = {};
		for(type in autoload) {
			var types = {};
			if(finalAutoload[type] === undefined) {
				finalAutoload[type] = {};
			}
			autoload[type] = this.sortObject(autoload[type]);
			for(level in autoload[type]) {
				for(ns in autoload[type][level]) {
					finalAutoload[type][ns] = './'+pa.relative(dir, autoload[type][level][ns]).replace(/\\/g, '/');
				}
			}
		}
		return finalAutoload;
	},
	
	sortObject: function(obj) {
		var sorted = {};
		var a = [];
		for(var key in obj) {
			if(obj.hasOwnProperty(key)) {
				a.push(key);
			}
		}
		a.sort();
		for(var key = 0; key < a.length; key++) {
			sorted[a[key]] = obj[a[key]];
		}
		return sorted;
	}
};


module.exports = Generator;
