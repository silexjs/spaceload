var resolve = require('path').resolve;
var fs = require('fs');


var Spaceload = function(debug) {
	if(debug !== undefined) {
		this.debug = debug;
		this.debugPrefix = {};
	}
};
Spaceload.prototype = {
	debug: false,
	prefix: {},
	cachePrefix: {},
	cachePath: [],
	
	register: function(prefix, path) {
		if(this.prefix[prefix] !== undefined) {
			throw new Error('['+prefix+'] prefix namespace is already registered');
		}
		if(this.debug === true) {
			this.debugPrefix[prefix] = path;
		}
		this.prefix[prefix] = {
			path: path,
			regexp: new RegExp('^'+prefix.replace(/(\.|\s+|\\|\/)/g, '\\.')+'(.*)$'),
		};
		return this;
	},
	use: function(namespace) {
		namespace = namespace.replace(/(\.|\s+|\\|\/)/g, '.');
		if(this.cachePrefix[namespace] !== undefined) {
			return this.cachePrefix[namespace];
		}
		if(this.debug === true) {
			var search = [];
		}
		for(var prefix in this.prefix) {
			var endNamespace = namespace.match(this.prefix[prefix].regexp)
			if(endNamespace !== null) {
				endNamespace = endNamespace[1].replace(/\./g, '\/');
				var path = resolve(this.prefix[prefix].path+endNamespace+'.js');
				this.cachePath.push(path);
				if(fs.existsSync(path) === true) {
					return this.cachePrefix[namespace] = require(path);
				} else if(this.debug === true) {
					search.push(path);
				}
			}
		}
		var message = '['+namespace+'] namespace not found';
		if(this.debug === true) {
			message += '.\nPaths tested :\n- '+search.join(', \n- ')+'\n';
			message += '\nPrefix list :\n';
			for(var prefix in this.debugPrefix) {
				message += '- '+prefix+' -> '+this.debugPrefix[prefix]+'\n';
			}
		}
		throw new Error(message);
	},
	cacheClear: function() {
		for(var i in this.cachePath) {
			delete require.cache[this.cachePath[i]];
		}
		this.cachePath = [];
	},
};

module.exports = function(debug, globalVar) {
	var spaceload = new Spaceload(debug);
	if(globalVar === undefined || globalVar === true) {
		GLOBAL.SPACELOAD = spaceload;
		GLOBAL.USE = function(namespace) { return SPACELOAD.use(namespace); };
	}
	return spaceload;
};
module.exports.Spaceload = Spaceload;
