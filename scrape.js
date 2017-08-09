const request = require('request');
const xpath = require('xpath');
const parse5 = require('parse5');
//const xmlser = require('xmlserializer');
//const dom = require('xmldom').DOMParser;

function getLyrics(sender, url) {
    console.log(url);
    let httpPromise = new Promise(function(resolve, reject) {
        request({uri: url,}, function (error, response, body) {
            if (error) {
                reject("Error: unable to get data." + error);
            }
            else {
                const sanitizedBody = body.toString().replace(/<br \/>|<i>|<\/i>|<!/g, '');
                // const document = parse5.parse(sanitizedBody.toString());
                // const xhtml = xmlser.serializeToString(document);
                // const doc = new dom().parseFromString(xhtml);
                // const select = xpath.useNamespaces({"site": "http://www.w3.org/1999/xhtml"});
                // const nodes = select("//site:div[@class='lcontent']", doc);
                const start = sanitizedBody.indexOf("lcontent") + 12;
                const end = sanitizedBody.indexOf("lfcredits") - 35;
                const response = sanitizedBody.substring(start, end);


                // const doc = new dom().parseFromString(sanitizedBody);
                // const nodes = xpath.select("//div[@class='lcontent']", doc);
                // console.log("=============== DOM" + doc)
                // console.log("=============== Nodes" + nodes)
                resolve(response);
            }
        });
    });

    httpPromise.then(function(result) {
        console.log('================== Lyrics:' + result);
        let lyrics = result;
        sendChunkedMessages(lyrics, sender, 0)
    }, function(err) {
        let messageData = { text:`Unable to access lyrics. ${err}` }
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token:process.env.PAGE_ACCESS_TOKEN},
            method: 'POST',
            json: {
                recipient: {id:sender},
                message: {text:messageData},
            }
        }, function(error, response) {
            if (error) {
                console.log('Error sending messages: ', error)
            } else if (response.body.error) {
                console.log('Error: ', response.body.error)
            }
        })
    });
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

module.exports.getLyrics = getLyrics;
