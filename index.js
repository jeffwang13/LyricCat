'use strict'

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

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
                sendGenericMessage(sender)
                continue
            }
            sendTextMessage(sender, "Hi, I'm LyricCat! Echo: " + text.substring(0, 200))
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

function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Diana Korkunova",
                    "subtitle": "Instagram model",
                    "image_url": "http://i.imgur.com/qLMi51J.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.instagram.com/diana_korkunova/?hl=en",
                        "title": "Instagram"
                    }, {
                        "type": "postback",
                        "title": "Vote",
                        "payload": "I choose Diana",
                    }],
                }, {
                    "title": "IU",
                    "subtitle": "Singer and actor",
                    "image_url": "http://www.allkpop.com/upload/2016/10/af_org/IU_1476317492_af_org.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.instagram.com/dlwlrma/?hl=en",
                        "title": "Instagram"
                    }, {
                        "type": "postback",
                        "title": "Vote",
                        "payload": "I choose IU",
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