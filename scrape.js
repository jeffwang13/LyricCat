const request = require('request');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

function getLyrics(sender, url) {
    let httpPromise = new Promise(function(resolve, reject) {
        request({uri: url,}, function (error, response, body) {
            if (error) {
                reject("Error: unable to get data." + error);
            }
            else {
                const doc = new dom().parseFromString(body);
                const response = xpath.select("/html/body/div[@id='wrapper']/div[@class='dvtable marginspace']/div[@class='trow']/div[@class='tdata datawidth']/div[@id='ldata']/div[@class='lcontent']", doc).toString();
                resolve(response);
            }
        });
    });

    httpPromise.then(function(result) {
        console.log('==================' + result);
        const lyrics = result;
        let messageData = { text:lyrics }
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
    }, function(err) {
        let messageData = { text:`Unable to access lyrics. ${err}` }
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
    });
}

module.exports.getLyrics = getLyrics;
