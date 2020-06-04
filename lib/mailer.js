const request = require('request')
const geniusApi = require('../api/geniusApi')
const spotify = require('../api/spotifyApi')

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    sendMessage(sender, messageData)
}

function sendLyricMessage(sender, song, artist) {
    geniusApi.getGeniusLyrics(sender, song, artist, function(noOfChunks) {
        if (noOfChunks != false) {
            spotify.getSongData(song, artist, function(songData) {
                sendButtonMessage(sender, song, artist, songData, noOfChunks)
            })
        }
    })
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

function sendButtonMessage(sender, song, artist, songData, timeout) {
    const message = `Here you go! What else can I tell you about ${song} by ${artist}? 😸`
    const timeoutMS = 1000 * timeout + 1000
    const guitarTutorialButton = { "type": "postback", "title": "Guitar Tutorial", "payload": `${song}_${artist}` }
    const danceCoverButton = { "type": "postback", "title": "Dance Cover", "payload": `${song}_${artist}` }
    const recommendSongButton = { "type": "postback", "title": "Recommend Song", "payload": `${song}_${artist}_${songData.art}_${songData.url}` }
    const payloadButtons = [{"type": "postback", "title": "Similar Songs", "payload": songData.id}]

    if (songData.genres.some((genre) => genre.includes("country"))) {
        payloadButtons.push(guitarTutorialButton)
    } else {
        payloadButtons.push(danceCoverButton)
    }
    payloadButtons.push(recommendSongButton)

    let messageData = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"generic",
                "elements":[
                    {
                        "title":message,
                        "image_url":songData.art,
                        "default_action": {
                            "type": "web_url",
                            "url": songData.url,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true
                        },
                        "buttons":payloadButtons
                    }
                ]
            }
        }
    }
    setTimeout(function() {
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
        }) }, timeoutMS
    )
}

function sendSimilarSongsMessage(sender, similarSongs) {
    const b1 = similarSongs[0].song
    const b2 = similarSongs[1].song
    const b3 = similarSongs[2].song
    const p1 = `${similarSongs[0].song}*${similarSongs[0].artist}`
    const p2 = `${similarSongs[1].song}*${similarSongs[1].artist}`
    const p3 = `${similarSongs[2].song}*${similarSongs[2].artist}`

    let messageData = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text":"Here are three similar songs:",
                "buttons":[
                    {
                        "type": "postback",
                        "title": b1,
                        "payload": p1
                    },
                    {
                        "type": "postback",
                        "title": b2,
                        "payload": p2
                    },
                    {
                        "type": "postback",
                        "title": b3,
                        "payload": p3
                    }
                ]
            }
        }
    }
    sendMessage(sender, messageData)
}

function sendVideoMessage(sender, videoData) {
    let messageData = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"generic",
                "elements":[
                    {
                        "title":videoData.title,
                        "image_url":videoData.image,
                        "default_action": {
                            "type": "web_url",
                            "url": videoData.url,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true
                        }
                    }
                ]
            }
        }
    }
    sendMessage(sender, messageData)
}

function sendRecommendMessage(sender, recipientName, recPayload) {
    const songName = recPayload.split("_")[0]
    const artist = recPayload.split("_")[1]
    const songArt = recPayload.split("_")[2]
    const songUrl = recPayload.split("_")[3]

    sendTextMessage(sender, `Almost there, just forward this message to ${recipientName}!`)

    let messageData = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"generic",
                "elements":[
                    {
                        "title":`Hey ${recipientName}! You should check out ${songName} by ${artist} 😃`,
                        "image_url":songArt,
                        "default_action": {
                            "type": "web_url",
                            "url": songUrl,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true
                        }
                    }
                ]
            }
        }
    }
    sendMessage(sender, messageData)
}

function sendMessage(recipient, messageData) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id:recipient},
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

module.exports.sendTextMessage = sendTextMessage;
module.exports.sendLyricMessage = sendLyricMessage;
module.exports.sendChunkedMessages = sendChunkedMessages;
module.exports.sendButtonMessage = sendButtonMessage;
module.exports.sendSimilarSongsMessage = sendSimilarSongsMessage;
module.exports.sendVideoMessage = sendVideoMessage;
module.exports.sendRecommendMessage = sendRecommendMessage;
