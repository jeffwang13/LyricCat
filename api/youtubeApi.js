const youtubeSearch = require( 'yt-search' )

function getDanceCover(song, artist, callback) {
    const opts = {
        query: `${song} ${artist} dance cover`,
        pageStart: 1,
        pageEnd: 1
    }
    youtubeSearch( opts, function ( err, r ) {
        if (err)
            throw err
        const topResult = r.videos[0]
        callback({title: topResult.title, url: topResult.url, image: topResult.image})
    })
}

function getGuitarTutorial(song, artist, callback) {
    const opts = {
        query: `${song} ${artist} guitar tutorial`,
        pageStart: 1,
        pageEnd: 1
    }
    youtubeSearch( opts, function ( err, r ) {
        if (err)
            throw err
        const topResult = r.videos[0]
        callback({title: topResult.title, url: topResult.url, image: topResult.image})
    })
}

module.exports.getDanceCover = getDanceCover;
module.exports.getGuitarTutorial = getGuitarTutorial;