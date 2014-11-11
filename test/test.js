new (require('../index.js'))();
require('./vandor/autoload.js');


var Query = SPACELOAD.use('Silex.ORM.Query');

var query = new Query('my-website');
console.log(query.findAll('client'));

SPACELOAD.cacheClear();
