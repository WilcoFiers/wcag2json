'use strict';
let testLang   = process.argv[2]
let originLang = process.argv[3] || 'en';

if (!testLang || !originLang) {
	throw "Must specify 2 languages";
}


function compareObject(origin, test) {
	if (typeof origin !== 'object') {
		throw Error("Expected object, got " + origin);
	}

	if (Object.keys(origin).length !== Object.keys(test).length) {
		throw Error("different number of keys" +
				+ JSON.stringify(test).substr(0, 100));
	}
	
	for (let prop of Object.keys(origin)) {
		if (typeof test[prop] !== typeof origin[prop]) {
			throw Error("prop " + prop + " not of type " + (typeof origin[prop]) +
					 + JSON.stringify(test[prop]).substr(0, 100));
		}
		if (Array.isArray(origin[prop])) {
			compareArray(origin[prop], test[prop]);

		} else if (typeof origin[prop] === 'object') {
			compareObject(origin[prop], test[prop])

		} else if (!origin[prop] !== !test[prop]) {
			throw Error("Expected " + origin[prop] + ' truthyness to equal ' + test[prop]);
		}
	}
}

function compareArray(origin, test) {
	if (origin.length !== test.length) {
		throw Error("Length of arrays should be the same " + 
				JSON.stringify(test).substr(0, 100));
	}
	for (let i = 0; i < origin.length; i += 1) {
		if (typeof origin[i] !== typeof test[i]) {
			throw Error("Exptected array value to be the same type " + 
					JSON.stringify(test[i]).substr(0, 100));
		} else if (typeof origin[i] === 'object') {
			compareObject(origin[i], test[i]);

		} else if (!origin[i] !== !test[i]) {
			throw Error("Expected " + origin[i] + ' truthyness to equal ' + test[i]);
		}


	}
}


let testData   = require('../wcag2-json/wcag2-' + testLang + '.json');
let originData = require('../wcag2-json/wcag2-' + originLang + '.json');

compareObject(originData, testData);
console.log('done comparing, no problems found');