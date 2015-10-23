'use strict';

let cheerio = require('cheerio');
let wcagIds = require('./wcagids.json');

function cleanString(str) {
	return str.trim().replace(/\s+/g, ' ');
}

function parseWcag(html) {
	let $ = cheerio.load(html);
    let $principles  = $('body .body .div1:first-child .div2');

    let parsers = {
        /**
         * Parse the DOM of a principle into it's JSON format
         */
        parsePrinciple(principle) {
            let $principle  = $(principle);
            let text        = $principle.find('h2.principle').text();
            let textParts   = text.split(/[:–-]/).map(cleanString);
            let num         = textParts[0].substr(-1);

            let guidelines  = [];
            $principle.find('.div3').each(function () {
            	guidelines.push(parsers.parseGuideline(this));
            });

            let output = {
                id:     wcagIds[num],
                num:    num,
                handle: textParts[1],
                title:  textParts[2],
                guidelines: guidelines
            };

            console.log(output.guidelines[0].successcriteria[0]);
            return output;
        },
        
        /**
         * Parse the DOM of a guideline into it's JSON format
         */
        parseGuideline(guideline) {
            let $guideline  = $(guideline);
            let text        = $guideline.find('.guideline h3').text();
            let textParts   = text.split(/\d\.\d|:/).map(cleanString);
            let num         = text.match(/\d\.\d/)[0];  

            let criteria    = [];
            $guideline.find('.sc').each(function () {
            	criteria.push(parsers.parseCriterion(this));
        	});
            
        	return {
        		'id': wcagIds[num],
        		'num': num,
        		'handle': textParts[1],
        		'title': textParts[2],
        		'successcriteria': criteria
        	};
        },

        /**
         * Parse the DOM of a criterion into it's JSON format
         */
        parseCriterion(criterion) {
            let $criterion  = $(criterion);
            let text        = $criterion.find('p').first().text();
            let textParts   = text.split(/\d.\d\.\d|:/).map(cleanString);
            let num         = text.match(/\d.\d\.\d/)[0];  

        	return {
        		'id': wcagIds[num], // BUGGY
        		'num': num,
        		'handle': textParts[1],
        		'text':   textParts[2],
        		'level': 'TODO',
        		'details': []
        	};
        }
    }
    
    return {
    	principles: $principles.map(function () {
    		return parsers.parsePrinciple(this);
		})
    }
}

module.exports = parseWcag;