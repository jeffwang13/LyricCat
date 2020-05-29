'use strict'

require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const geniusApi = require('./geniusApi')
const mailer = require('./mailer')

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
                mailer.sendCompareMessage(sender)
                continue
            }
            if (/Song:.+Artist:.+/i.test(text)) {
                const song = text.match(/song:(.+)artist:/i)[1].trim().toLocaleLowerCase().replace(/ /g, '');
                const artist = text.match(/artist:(.+)/i)[1].trim().toLocaleLowerCase().replace(/ /g, '');
                mailer.sendLyricMessage(sender, song, artist);
                continue;
            }
            mailer.sendTextMessage(sender, "Hi, I'm LyricCat! Message me 'Song: {YourSong} Artist: {SongArtist}' for lyrics.")
        }
        if (event.postback) {
            let text = JSON.stringify(event.postback)
            mailer.sendTextMessage(sender, "Vote Registered: "+text.substring(0, 200), process.env.PAGE_ACCESS_TOKEN)
            continue
        }
    }
    res.sendStatus(200)
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})