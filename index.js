'use strict'

require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const geniusApi = require('./api/geniusApi')
const mailer = require('./lib/mailer')
const redis = require('./lib/redis')
const spotify = require('./api/spotifyApi')
const youtube = require('./api/youtubeApi')

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
        redis.getConversationStep(sender, function(conversationStep) {
            if (event.message && event.message.text) {
                const text = event.message.text

                if (conversationStep == "SS0") {
                    redis.setConversationStep(sender, "SS1")
                    mailer.sendTextMessage(sender, "Hi, I'm LyricCat 😸, a chatbot to help you with all things musical!\n\nWhat's the name of the song you would like the lyrics for?")
                } else if (conversationStep == "RS0") {
                    redis.setConversationStep(sender, "SS1")
                    mailer.sendTextMessage(sender, "What's the name of another song you would like lyrics for? 😺")
                } else if (conversationStep == "SS1") {
                    redis.setConversationStep(sender, "SS2")
                    redis.setSong(sender, text)
                    mailer.sendTextMessage(sender, `Great! Just to be sure, ${text} by who?`)
                } else if (conversationStep == "SS2") {
                    redis.setConversationStep(sender, "RS0")
                    redis.setArtist(sender, text)
                    redis.getSong(sender, function(response) {
                        const song = response
                        const artist = text
                        mailer.sendLyricMessage(sender, song, artist)
                    })
                }
            } else if (event.postback) {
                const title = event.postback.title
                const payload = event.postback.payload

                if (title === "Similar Songs") {
                    spotify.getSimilarSongs(payload, function(response) {
                        mailer.sendSimilarSongsMessage(sender, response)
                    })
                } else if (payload.includes("*")) {
                    // Similar song tapback, send user similar song lyrics and set them back to RS0
                    const song = payload.split("*")[0]
                    const artist = payload.split("*")[1]
                    redis.setConversationStep(sender, "RS0")
                    redis.setSong(sender, song)
                    redis.setArtist(sender, artist)
                    mailer.sendLyricMessage(sender, song, artist)
                } else if (title === "Dance Cover") {
                    const song = payload.split("_")[0]
                    const artist = payload.split("_")[1]
                    youtube.getDanceCover(song, artist, sender, function(videoData) {
                        mailer.sendVideoMessage(sender, videoData)
                    })
                } else if (title === "Guitar Tutorial") {
                    const song = payload.split("_")[0]
                    const artist = payload.split("_")[1]
                    youtube.getGuitarTutorial(song, artist, sender, function(videoData) {
                        mailer.sendVideoMessage(sender, videoData)
                    })
                } else {
                    mailer.sendTextMessage(sender, `Sorry, I don't know ${title} yet, but I am in the process of learning! 😸`)
                }
            }
        })
    }
    res.sendStatus(200)
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})
