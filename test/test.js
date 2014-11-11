new (require('../index.js'))();
require('./vandor/autoload.js');


var Query = USE('Silex.ORM.Query');

var query = new Query('my-website');
console.log(query.findAll('client'));

SPACELOAD.cacheClear();
