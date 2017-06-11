'use strict'

require('dotenv').config()

const cheerio = require('cheerio');
const xpath = require('xpath')
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const scrapers = require('./scrape')

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Suh dudes, I am the best lyric bot on the web. Git git git drrrrrah!')
})

// for Facebook verification
app.get('/webhook', function(req, res) {
    if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            if (text === 'CompareCat') {
                sendCompareMessage(sender)
                continue
            }
            if (/Song:.+Artist:.+/i.test(text)) {
                const song = text.match(/song:(.+)artist:/i)[1].trim().toLocaleLowerCase().replace(/ /g, '');
                const artist = text.match(/artist:(.+)/i)[1].trim().toLocaleLowerCase().replace(/ /g, '');
                sendLyricMessage(sender, song, artist);
                continue;
            }
            sendTextMessage(sender, "Hi, I'm LyricCat! Message me 'Song: {YourSong} Artist: {SongArtist}' for lyrics.")
        }
        if (event.postback) {
            let text = JSON.stringify(event.postback)
            sendTextMessage(sender, "Vote Registered: "+text.substring(0, 200), process.env.PAGE_ACCESS_TOKEN)
            continue
        }
    }
    res.sendStatus(200)
})

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id:sender},
            messages:[
                messageData,
                { text:'Message 2'}
            ]
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
    const lyricsUrl = `http://www.lyricsondemand.com/${artist.charAt(0)}/${artist}lyrics/${song}lyrics.html`;
    const lyrics = scrapers.getLyrics(sender, lyricsUrl);
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

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})