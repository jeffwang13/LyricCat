var Client = require('node-rest-client').Client;

var client = new Client();

function queryLyrics (song){
    client.get("api.genius.com/songs/1", function (data, response) {
        // parsed response body as js object
        console.log(data);
        // raw response
        console.log(response);
    });
}

module.exports.queryLyrics = queryLyrics;

