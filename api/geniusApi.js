const request = require('request');
const lyricAPI = require('genius-lyrics-api');
const mailer = require('../lib/mailer')

function getGeniusLyrics(sender, song, artist, callback) {
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
        noOfChunks = lyrics.length / 640.0
        mailer.sendChunkedMessages(lyrics, sender, 0)
        callback(noOfChunks)
    }).catch(function(err) {
        let message = `Oh no! ${song} by ${artist} was not found in the Genius database.`
        mailer.sendTextMessage(sender, message)
        callback(false)
    });
}

module.exports.getGeniusLyrics = getGeniusLyrics;
