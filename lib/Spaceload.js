var pa = require('path');
var fs = require('fs');


var Spaceload = function(debug, basePath) {
	if(debug === true) {
		this.debug = debug;
		this.debugPrefix = {};
	}
	this.basePath = basePath || null;
};
Spaceload.prototype = {
	debug: false,
	prefix: {},
	cachePrefix: {},
	cachePath: [],
	
	registerFile: function(path) {
		if(typeof path === 'string') {
			var autoload = require(pa.resolve(path));
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
		if(this.basePath !== null) {
			path = pa.join(this.basePath, path);
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
	use: function(namespace, returnPath) {
		var namespace = namespace.replace(/(\.|\s+|\\|\/)/g, '.');
		var returnPath = returnPath || false;
		if(this.cachePrefix[namespace] !== undefined) {
			if(returnPath === false) {
				return require(this.cachePrefix[namespace]);
			} else {
				return this.cachePrefix[namespace];
			}
		}
		if(this.debug === true) {
			var search = [];
		}
		for(var prefix in this.prefix) {
			var endNamespace = namespace.match(this.prefix[prefix].regexp);
			if(endNamespace !== null) {
				if(this.prefix[prefix]['type'] === 'dir') {
					endNamespace = endNamespace[1].replace(/\./g, '\/');
					var path = pa.resolve(this.prefix[prefix].path+endNamespace+'.js');
				} else {
					var path = pa.resolve(this.prefix[prefix].path);
				}
				this.cachePath.push(path);
				if(fs.existsSync(path) === true) {
					this.cachePrefix[namespace] = path;
					if(returnPath === false) {
						return require(path);
					} else {
						return path;
					}
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
	getPath: function(namespace, replaceSlash) {
		var replaceSlash = (replaceSlash!==undefined)?replaceSlash:true;
		var path = this.use(namespace, true);
		if(replaceSlash === true) {
			return path.replace(/\\/g, '/');
		} else {
			return path;
		}
	},
	cacheClear: function() {
		for(var i in this.cachePath) {
			delete require.cache[this.cachePath[i]];
		}
		this.cachePath = [];
	},
};


module.exports = function(debug, basePath, globalVar) {
	var basePath = basePath || null;
	var spaceload = new Spaceload(debug, basePath);
	if(globalVar !== false) {
		GLOBAL.SPACELOAD = spaceload;
		GLOBAL.USE = function(namespace) { return SPACELOAD.use(namespace); };
	}
	return spaceload;
};
module.exports.Spaceload = Spaceload;
