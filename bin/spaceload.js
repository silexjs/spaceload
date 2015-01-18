var path = require('path');
var fs = require('fs');
var cmd = require('commander');
var glob = require('glob');

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

cmd.version(require('../package.json')['version']);
cmd.command('install [<dir>]')
	.option('-o, --out <file>', 'Output file name')
	.option('--test', 'Takes into account the test files of Spaceload')
	.description('Search (in package.json files node_modules folder) and create the autoload file (json)')
	.action(function(dir) {
		var dir = dir || '.';
		var outFileName = this.out || 'autoload.json';
		var autload = {};
		var packages = glob(path.resolve(dir)+'/**/node_modules/*/package.json', function(file) {
			if(this.test === undefined && file.search('node_modules/spaceload/test/node_modules/') !== -1) {
				return false;
			}
		});
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
		var outFilePath = path.normalize(path.resolve(dir)+'/'+outFileName);
		fs.writeFileSync(outFilePath, JSON.stringify(finalAutoload, null, '\t'));
		
		console.log('File "'+outFileName+'" created and contains: ('+outFilePath+')');
		var nPSR4 = 0; if(finalAutoload['psr-4'] !== undefined) { nPSR4 = Object.keys(finalAutoload['psr-4']).length; }
		console.log('"psr-4":    '+nPSR4+' namespace'+(nPSR4>1?'s':'')+' found');
		var nCLASSMAP = 0; if(finalAutoload['classmap'] !== undefined) { nCLASSMAP = Object.keys(finalAutoload['classmap']).length; }
		console.log('"classmap": '+nCLASSMAP+' namespace'+(nCLASSMAP>1?'s':'')+' found');
		console.log('');
	});
cmd.parse(process.argv);

if(cmd.args.length <= 1) {
	cmd.help();
}