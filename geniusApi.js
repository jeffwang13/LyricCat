const request = require('request');
const lyricAPI = require('genius-lyrics-api');
const mailer = require('./mailer')

function getGeniusLyrics(sender, song, artist) {
    const options = {
        apiKey: process.env.GENIUS_TOKEN, // genius developer access token
        title: song,
        artist: artist,
        optimizeQuery: true
    };

    lyricAPI.getLyrics(options).then(function(result) {
        let lyrics = result;
        if (lyrics == null) {
            throw "NotFound"
        }
        mailer.sendChunkedMessages(lyrics, sender, 0)
    }).catch(function(err) {
        let message = "Oh no! The song you requested was not found in the Genius database."
        mailer.sendTextMessage(sender, message)
    });
}

module.exports.getGeniusLyrics = getGeniusLyrics;