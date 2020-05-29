const request = require('request')
const geniusApi = require('./geniusApi')

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendLyricMessage(sender, song, artist) {
    const lyrics = geniusApi.getGeniusLyrics(sender, song, artist);
}

function sendChunkedMessages(lyrics, sender, count) {
    if (lyrics.length <= 0)
        return
    chunkedMessageHelper(lyrics.substring(0, 640), sender, ++count)
    sendChunkedMessages(lyrics.substring(640), sender, count)
    return
}

function chunkedMessageHelper(messageData, recipient, count) {
    setTimeout(function() {
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

function sendCompareMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Drake",
                    "subtitle": "Champagne papi",
                    "image_url": "http://www.media1.hw-static.com/media/2017/04/wenn_drake_041317_1800x1200-1800x1200.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://youtu.be/sR_pfk9JVlc",
                        "title": "Song"
                    }, {
                        "type": "postback",
                        "title": "Vote",
                        "payload": "I choose Drake",
                    }],
                }, {
                    "title": "NAV",
                    "subtitle": "Doesn't pay for his sneakers",
                    "image_url": "http://universalmusic.umg-wp.com/files/2017/02/NAV.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://youtu.be/4B7J_Ql2vjo",
                        "title": "Song"
                    }, {
                        "type": "postback",
                        "title": "Vote",
                        "payload": "I choose NAV",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

module.exports.sendTextMessage = sendTextMessage;
module.exports.sendLyricMessage = sendLyricMessage;
module.exports.sendCompareMessage = sendCompareMessage;
module.exports.sendChunkedMessages = sendChunkedMessages;
