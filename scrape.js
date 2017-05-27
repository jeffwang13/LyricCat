const request = require('request');
var xpath = require('xpath')
    , dom = require('xmldom').DOMParser

// console.log(getLyrics('http://www.azlyrics.com/lyrics/desiigner/panda.html'))
//
// function getLyrics (url){
  request({
      uri: 'http://www.azlyrics.com/lyrics/desiigner/panda.html',
  }, function(error, response, body) {
      const doc = new dom().parseFromString(body);
      const lyrics = xpath.select("/html/body/div[@class='container main-page']/div[@class='row']/div[@class='col-xs-12 col-lg-8 text-center']/div[5]", doc).toString();
      console.log(lyrics);
  });
//   return '';
// }

//module.exports.getLyrics = getLyrics;


