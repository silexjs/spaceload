var autoload = require('./autoload.json');

for(type in autoload) {
	for(ns in autoload[type]) {
		SPACELOAD.register(ns, __dirname+'/'+autoload[type][ns]);
	}
}
