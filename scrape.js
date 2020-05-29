const request = require('request');
const lyricAPI = require('genius-lyrics-api');

function getGeniusLyrics(sender, song, artist) {
    const options = {
        apiKey: process.env.GENIUS_TOKEN, // genius developer access token
        title: song,
        artist: artist,
        optimizeQuery: true
    };

    lyricAPI.getLyrics(options).then(lyrics => console.log(lyrics));

    // httpPromise.then(function(result) {
    //     console.log('================== Lyrics:' + result);
    //     let lyrics = result;
    //     sendChunkedMessages(lyrics, sender, 0)
    // }, function(err) {
    //     let messageData = { text:`Unable to access lyrics. ${err}` }
    //     request({
    //         url: 'https://graph.facebook.com/v2.6/me/messages',
    //         qs: {access_token:process.env.PAGE_ACCESS_TOKEN},
    //         method: 'POST',
    //         json: {
    //             recipient: {id:sender},
    //             message: {text:messageData},
    //         }
    //     }, function(error, response) {
    //         if (error) {
    //             console.log('Error sending messages: ', error)
    //         } else if (response.body.error) {
    //             console.log('Error: ', response.body.error)
    //         }
    //     })
    // });
}

function sendChunkedMessages(lyrics, sender, count) {
    if (lyrics.length <= 0)
        return
    sendMessage(lyrics.substring(0, 640), sender, ++count)
    sendChunkedMessages(lyrics.substring(640), sender, count)
    return
}

function sendMessage(messageData, recipient, count) {
    setTimeout(function() {
        console.log("Lyrics==================== " + messageData)
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token:process.env.PAGE_ACCESS_TOKEN},
            method: 'POST',
            json: {
                recipient: {id:recipient},
                message: {text:messageData},
            }
        }, function(error, response) {
            if (error) {
                console.log('Error sending messages: ', error)
            } else if (response.body.error) {
                console.log('Error: ', response.body.error)
            }
        })}, 1000 * count
    );
}

module.exports.getGeniusLyrics = getGeniusLyrics;
