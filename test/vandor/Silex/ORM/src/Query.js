module.exports = function(db) {
	this.db = db;
};
module.exports.prototype = {
	db: null,
	
	findAll: function(table) {
		return 'SELECT * FORM '+table+';';
	},
};
