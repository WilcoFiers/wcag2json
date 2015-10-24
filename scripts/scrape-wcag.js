// Import libraries
let request   = require('request');
let cheerio   = require('cheerio');
let fs        = require('fs');
let parseWcag = require('../lib/parseWcag');

// Set up some data
let translationUrls = require('../translations.json');
let currLang        = 'nl';
let filePath        = './html/wcag2-' + currLang + '.html';


// Check if we know the file already
new Promise(function (resolve, reject) {
    fs.exists(filePath, resolve);

// Get the HTML
}).then(function (exists) {
    return new Promise(function (resolve, reject) {
        if (exists) {
            // Load locally
            console.log('reading ' + filePath);
            fs.readFile(filePath, 'utf8', function (error, data) {
                if (error) {
                    reject(error);
                }
                resolve(data);
            });

        } else {
            // Load from URL and store locally
            let url = translationUrls[currLang];
            console.log('loading ' + url);

            request(url, function (error, response, html) {
                if (error || response.statusCode != 200) {
                    reject(error || response);
                }

                console.log('writing ' + filePath);
                fs.writeFile(filePath, html, 'utf8', function (error) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(html);
                    }
                });
            });
        }
    });

// Scrape the HTML
}).then(parseWcag)
// Catch any errors
.catch(console.error.bind(console, 'ERR'));
