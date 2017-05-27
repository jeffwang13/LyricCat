const request = require('request');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

function getLyrics(url) {
  request({
    uri: url,
  }, function (error, response, body) {
    const doc = new dom().parseFromString(body);
    const lyrics = xpath.select("/html/body/div[@class='container main-page']/div[@class='row']/div[@class='col-xs-12 col-lg-8 text-center']/div[5]", doc).toString();
    return lyrics;
  });
  return '';
}

module.exports.getLyrics = getLyrics;
