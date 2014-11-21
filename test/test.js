new (require('../index.js'))(true);
require('./autoload.js');

var Bonjour = USE('Sitexw.Bonjour.Speak');
var bonjour = new Bonjour();
console.log(bonjour.test('Valentin'));

var Hello = USE('Sitexw.Hello.Speak');
var hello = new Hello();
console.log(hello.test('Valentin'));

var Hola = USE('Sitexw.Hola.Speak');
var hola = new Hola();
console.log(hola.test('Valentin'));

var Alpha = USE('Silex.Alpha.Test');
var alpha = new Alpha();
console.log(alpha.whaIYourName());

var Beta = USE('Silex.Beta');
var beta = new Beta();
console.log(beta.whaIYourName());

var Charlie = USE('Silex.Charlie.Hello.Hola.Bonjour.Test');
var charlie = new Charlie();
console.log(charlie.whaIYourName());
