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
	
	registerFile: function(path) {
		if(typeof path === 'string') {
			var autoload = require(resolve(path));
		} else {
			var autoload = path;
		}
		for(type in autoload) {
			for(ns in autoload[type]) {
				this.register(ns, autoload[type][ns]);
			}
		}
		return this;
	},
	register: function(prefix, path) {
		if(this.prefix[prefix] !== undefined) {
			throw new Error('['+prefix+'] prefix namespace is already registered');
		}
		if(this.debug === true) {
			this.debugPrefix[prefix] = path;
		}
		this.prefix[prefix] = {
			type: (/.*\.js$/.test(path)?'file':'dir'),
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
			if(this.prefix[prefix]['type'] === 'dir') {
				var endNamespace = namespace.match(this.prefix[prefix].regexp)
			} else {
				var endNamespace = true;
			}
			if(endNamespace !== null) {
				if(this.prefix[prefix]['type'] === 'dir') {
					endNamespace = endNamespace[1].replace(/\./g, '\/');
					var path = resolve(this.prefix[prefix].path+endNamespace+'.js');
				} else {
					var path = resolve(this.prefix[prefix].path);
				}
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
