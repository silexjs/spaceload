var pa = require('path');
var fs = require('fs');
var cmd = require('commander');

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
	.option('-o, --out <fileName>', 'Output file name')
	.option('-i, --indentation <value>', 'Allows you to choose the type of indentation (t=TABULATION and s=SPACE. Default: t)')
	.option('--test', 'Takes into account the test files of Spaceload')
	.description('Search (in package.json files node_modules folder) and create the autoload file (json)')
	.action(function(dir, option) {
		var dir = pa.resolve(dir || '');
		var out = option.out || 'autoload.json';
		var indentation = (option.indentation || 't').replace(/t/ig, '\t').replace(/s/ig, ' ');
		var test = option.test || false;
		
		var Generator = require('../lib/Generator.js');
		var generator = new Generator;
		var autoload = generator.analyser(dir, test);
		var outPath = pa.normalize(dir+'/'+out);
		fs.writeFileSync(outPath, JSON.stringify(autoload, null, indentation));
		
		console.log('File "'+out+'" created and contains: ('+outPath+')');
		var nPSR4 = 0; if(autoload['psr-4'] !== undefined) { nPSR4 = Object.keys(autoload['psr-4']).length; }
		console.log('"psr-4":     '+nPSR4+' namespace'+(nPSR4>1?'s':'')+' found');
		var nCLASSMAP = 0; if(autoload['classmap'] !== undefined) { nCLASSMAP = Object.keys(autoload['classmap']).length; }
		console.log('"classmap":  '+nCLASSMAP+' namespace'+(nCLASSMAP>1?'s':'')+' found');
	});
cmd.parse(process.argv);

if(cmd.args.length <= 1) {
	cmd.help();
}