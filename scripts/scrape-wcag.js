// Import libraries
var request   = require('request');
var cheerio   = require('cheerio');
var fs        = require('fs');
var parseWcag = require('../parseWcag');

// Set up some data
var translationUrls = require('../translations.json');
var currLang        = 'nl';
var filePath        = './html/wcag2-' + currLang + '.html';


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
            var url = translationUrls[currLang];
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
