const mailer = require('../lib/mailer')
const youtubeSearch = require( 'yt-search' )

function getDanceCover(song, artist, sender, callback) {
    query = `${song} ${artist} dance cover`
    executeSearch(query, sender, function(result) {
        callback(result)
    })
}

function getGuitarTutorial(song, artist, sender, callback) {
    query = `${song} ${artist} guitar tutorial`
    executeSearch(query, sender, function(result) {
        callback(result)
    })
}

function executeSearch(query, sender, callback) {
    const opts = {
        query: query,
        pageStart: 1,
        pageEnd: 1
    }
    youtubeSearch( opts, function (err, r) {
        if (err || typeof(r.videos[0]) === 'undefined') {
            setTimeout(function(){
                executeSearch(query, sender, function(result) {
                    callback(result)
                })
            }, 1000)
        } else {
            const topResult = r.videos[0]
            callback({title: topResult.title, url: topResult.url, image: topResult.image})
        }
    })
}

module.exports.getDanceCover = getDanceCover;
module.exports.getGuitarTutorial = getGuitarTutorial;