var resolve = require('path').resolve;


var Spaceload = function() {};
Spaceload.prototype = {
	prefix: {},
	cachePrefix: {},
	cachePath: [],
	
	register: function(prefix, path) {
		if(this.prefix[prefix] !== undefined) {
			throw new Error('['+prefix+'] prefix namespace is already registered');
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
		for(var prefix in this.prefix) {
			var endNamespace = namespace.match(this.prefix[prefix].regexp)
			if(endNamespace !== null) {
				endNamespace = endNamespace[1].replace(/\./g, '\/');
				try {
					var path = resolve(this.prefix[prefix].path+endNamespace+'.js');
					this.cachePath.push(path);
					return this.cachePrefix[namespace] = require(path);
				} catch(e) {}
			}
		}
		throw new Error('['+namespace+'] namespace not found');
	},
	cacheClear: function() {
		for(var i in this.cachePath) {
			delete require.cache[this.cachePath[i]];
		}
		this.cachePath = [];
	},
};

module.exports = function(globalVar) {
	var spaceload = new Spaceload();
	if(globalVar === undefined || globalVar === true) {
		GLOBAL.SPACELOAD = spaceload;
		GLOBAL.USE = function(namespace) { return SPACELOAD.use(namespace); };
	}
	return spaceload;
};
module.exports.Spaceload = Spaceload;
