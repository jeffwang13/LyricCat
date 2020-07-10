const mailer = require('../lib/mailer')
const youtubeSearch = require('youtube-search');


function getDanceCover(song, artist, sender, callback) {
    query = `${song} ${artist} dance cover`
    executeSearch(query, function(result) {
        callback(result)
    })
}

function getGuitarTutorial(song, artist, sender, callback) {
    query = `${song} ${artist} guitar tutorial`
    executeSearch(query, function(result) {
        callback(result)
    })
}

function executeSearch(query, callback) {
    const opts = {
        maxResults: 1,
        key: process.env.GOOGLE_API_KEY
    }

    youtubeSearch(query, opts, function(err, results) {
        if(err) return console.log(err);

        const topResult = results[0]
        callback({title: topResult.title, url: topResult.link, image: `https://img.youtube.com/vi/${topResult.id}/0.jpg`})
    })
}

module.exports.getDanceCover = getDanceCover;
module.exports.getGuitarTutorial = getGuitarTutorial;
