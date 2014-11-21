var path = require('path');
var fs = require('fs');
var cmd = require('commander');
var glob = require('silex-glob');

function sortObject(o) {
	var sorted = {},
	key, a = [];
	for(key in o) {
		if(o.hasOwnProperty(key)) {
			a.push(key);
		}
	}
	a.sort();
	for(key = 0; key < a.length; key++) {
		sorted[a[key]] = o[a[key]];
	}
	return sorted;
}

cmd.version(require('./package.json')['version']);
cmd.command('register <dir>')
	.description('Search all autoloads configuration in all "node_modules" dirs')
	.action(function(dir) {
		var autload = {};
		var packages = glob(path.resolve(dir)+'/**/node_modules/*/package.json');
		for(i in packages) {
			var pack = require(packages[i]);
			if(pack['autoload'] !== undefined) {
				for(type in pack['autoload']) {
					if(autload[type] === undefined) {
						autload[type] = {};
					}
					for(ns in pack['autoload'][type]) {
						var nsClean = ns.replace(/(\.|\s+|\\|\/)/g, '\\');
						var level = nsClean.split('\\').length;
						if(autload[type][level] === undefined) {
							autload[type][level] = {};
						}
						autload[type][level][nsClean] = path.join(path.dirname(packages[i]), pack['autoload'][type][ns]);
					}
				}
			}
		}
		var finalAutoload = {};
		for(type in autload) {
			var types = {};
			if(finalAutoload[type] === undefined) {
				finalAutoload[type] = {};
			}
			autload[type] = sortObject(autload[type]);
			for(level in autload[type]) {
				for(ns in autload[type][level]) {
					finalAutoload[type][ns] = path.relative(path.resolve(dir), autload[type][level][ns]);
				}
			}
		}
		fs.writeFileSync(path.resolve(dir)+'/autoload.json', JSON.stringify(finalAutoload, null, '\t'));
	});
cmd.parse(process.argv);