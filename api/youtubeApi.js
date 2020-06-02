const mailer = require('../lib/mailer')
const youtubeSearch = require( 'yt-search' )

function getDanceCover(song, artist, sender, callback) {
    const opts = {
        query: `${song} ${artist} dance cover`,
        pageStart: 1,
        pageEnd: 1
    }
    youtubeSearch( opts, function ( err, r ) {
        if (err || typeof(r.videos[0]) === 'undefined') {
            let message = `Oh no! There was a problem with the official YouTube API, please try again.`
            mailer.sendTextMessage(sender, message)
        } else {
            const topResult = r.videos[0]
            callback({title: topResult.title, url: topResult.url, image: topResult.image})
        }
    })
}

function getGuitarTutorial(song, artist, sender, callback) {
    const opts = {
        query: `${song} ${artist} guitar tutorial`,
        pageStart: 1,
        pageEnd: 1
    }
    youtubeSearch( opts, function ( err, r ) {
        if (err || typeof(r.videos[0]) === 'undefined') {
            let message = `Oh no! There was a problem with the official YouTube API, please try again.`
            mailer.sendTextMessage(sender, message)
        } else {
            const topResult = r.videos[0]
            callback({title: topResult.title, url: topResult.url, image: topResult.image})
        }
    })
}

module.exports.getDanceCover = getDanceCover;
module.exports.getGuitarTutorial = getGuitarTutorial;