const Spotify = require('node-spotify-api');
const redis = require('../lib/redis')

const spotify = new Spotify({
    id: process.env.SPOTIFY_CLIENT_ID,
    secret: process.env.SPOTIFY_CLIENT_SECRET
});

function getSongLink(songName, artist, callback) {
    getTrack(songName, artist, function(trackData){
        if (typeof trackData.tracks.items[0] !== 'undefined') {
            callback(trackData.tracks.items[0].external_urls.spotify)
        }
    })
}

function getSongArt(songName, artist, callback) {
    getTrack(songName, artist, function(trackData){
        if (typeof trackData.tracks.items[0] !== 'undefined') {
            callback(trackData.tracks.items[0].album.images[0].url)
        }
    })
}

function getTrack(songName, artist, callback) {
    redis.getSongData(songName, artist, function(cacheData){
        if (cacheData == null) {
            spotify.search({ type: 'track', query: `${songName} ${artist}`, limit: 1 }, function(err, data) {
                if (err) {
                    return console.log('Error occurred: ' + err);
                }
                redis.setSongData(songName, artist, JSON.stringify(data))
                callback(data)
            })
        } else {
            callback(JSON.parse(cacheData))
        }
    })
}

module.exports.getSongLink = getSongLink;
module.exports.getSongArt = getSongArt;
module.exports.getTrack = getTrack;
