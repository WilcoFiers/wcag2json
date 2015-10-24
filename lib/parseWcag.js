'use strict';

let cheerio = require('cheerio');
let wcagIds = require('./wcagids.json');


function parseHtml(html) {
    let $ = cheerio.load(html);
    let $principles = $('body .body .div1:first-child .div2');
    let principles  = [];

    $principles.each(function () {
        let principle = parsePrinciple($(this));
        principles.push(principle);
    });

    return { principles: principles };
}

/**
 * Parse the DOM of a principle into it's JSON format
 */
function parsePrinciple($principle) {
    let text        = $principle.find('h2.principle').text();
    let num         = text.match(/\d/)[0];

    // Get the handle+text
    let subText     = splitOnce(text, /\d:/)[1]
    // Split the handle from the text
    let textParts   = splitOnce(subText, /[–-]/).map(cleanString);

    let guidelines  = [];
    $principle.find('.div3').each(function () {
        let guidline = parseGuideline($principle.find(this));
        guidelines.push(guidline);
    });

    let output = {
        id:     wcagIds[num],
        num:    num,
        handle: textParts[0],
        text:  textParts[1],
        guidelines: guidelines
    };
    
    return output;
}

/**
 * Parse the DOM of a guideline into it's JSON format
 */
function parseGuideline($guideline) {
    let text        = $guideline.find('.guideline h3').text();
    let num         = text.match(/\d\.\d/)[0];

    // Get the handle+text
    let subText     = splitOnce(text, /\d\.\d/)[1];
    // Split the handle from the text
    let textParts   = splitOnce(subText, /:/).map(cleanString);

    let criteria    = [];
    $guideline.find('.sc').each(function () {
        let criterion = parseCriterion($guideline.find(this));
        criteria.push(criterion);
    });
    
    return {
        'id': wcagIds[num],
        'num': num,
        'handle': textParts[0],
        'text': textParts[1],
        'successcriteria': criteria
    };
}

/**
 * Parse the DOM of a criterion into it's JSON format
 */
function parseCriterion($criterion) {
    let text        = $criterion.find('p').first().text();
    let num         = text.match(/\d\.\d\.\d+/)[0];

    // Get the handle+text
    let subText     = splitOnce(text, /\d\.\d\.\d+/)[1]
    // Split the handle from text+level
    let textParts    = splitOnce(subText, /:/).map(cleanString);
    // split the level from the text
    let levelPos     = textParts[1].lastIndexOf('(');
    let textSubParts = splitOnIndex(textParts[1], levelPos-1);

    let level;
    if (textSubParts[1].indexOf('AAA') !== -1) {
        level = 'AAA';
    } else if (textSubParts[1].indexOf('AA') !== -1) {
        level = 'AA';
    } else {
        level = 'A'
    }

    return {
        'id': wcagIds[num], // BUGGY
        'num': num,
        'handle': textParts[0],
        'text':   textSubParts[0].trim(),
        'level':  level,
        'details': parseCriterionDetails($criterion)
    };
}

/** Get the details value of the  */
function parseCriterionDetails($criterion) {
    let details = [];

    $criterion.find('.note > p, ul, ol').each(function () {
        let $elm = $criterion.find(this);
        
        if ($elm.is('ul, ol')) {
            let detail = {
                type: ($elm.is('ol') ? 'olist' : 'ulist'),
                items: []
            };

            $elm.find('li').each(function () {
                let $li    = $elm.find(this);
                let handle = cleanString($li.find('strong').text());
                let text   = cleanString($li.text().replace(handle, ''));
                detail.items.push({
                    handle: handle.replace(':', ''),
                    text: text
                });
            });
            details.push(detail);

        } else {
            let handle = cleanString($elm.find('em').text());
            let text   = cleanString($elm.text().replace(handle, ''));
            details.push({
                type: 'note',
                handle: handle.replace(':', ''),
                text: text
            });
        }
    });

    if (details.length > 0) {
        return details;
    }
}


/** Some string helpers **/
function cleanString(str) {
    return str.trim().replace(/\s+/g, ' ');
}

function splitOnIndex(str, index) {
    return [str.substr(0, index), str.substr(index)];
}

function splitOnce(str, regex) {
    let match = str.match(regex);
    if (match) {
        let match_i = str.indexOf(match[0]);
        return [str.substring(0, match_i),
        str.substring(match_i + match[0].length)];
    } else {
        return [str, ""];
    }
}


exports.parseHtml             = parseHtml;
exports.parsePrinciple        = parsePrinciple;
exports.parseGuideline        = parseGuideline;
exports.parseCriterion        = parseCriterion;
exports.parseCriterionDetails = parseCriterionDetails;