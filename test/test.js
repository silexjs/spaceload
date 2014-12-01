console.log('#################### Spacelaod start test');

new (require('../index.js'))(true);
SPACELOAD.registerFile('./autoload.json');


var Bonjour = USE('Sitexw.Bonjour.Speak');
var Hello = USE('Sitexw.Hello.Speak');
var Hola = USE('Sitexw.Hola.Speak');
var Alpha = USE('Silex.Alpha.Test');
var Beta = USE('Silex.Beta');
var Charlie = USE('Silex.Charlie.Hello.Hola.Bonjour.Test');


var bonjour = new Bonjour();
console.log(bonjour.test('Valentin'));

var hello = new Hello();
console.log(hello.test('Valentin'));

var hola = new Hola();
console.log(hola.test('Valentin'));

var alpha = new Alpha();
console.log(alpha.whaIYourName());

var beta = new Beta();
console.log(beta.whaIYourName());

var charlie = new Charlie();
console.log(charlie.whaIYourName());

console.log('#################### Spacelaod end test\n');
