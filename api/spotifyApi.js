const Spotify = require('node-spotify-api');
const redis = require('../lib/redis')

const spotify = new Spotify({
    id: process.env.SPOTIFY_CLIENT_ID,
    secret: process.env.SPOTIFY_CLIENT_SECRET
});

function getSongData(songName, artist, callback) {
    getTrack(songName, artist, function(trackData){
        if (typeof trackData.tracks.items[0] !== 'undefined') {
            const trackId = trackData.tracks.items[0].id
            const trackLink = trackData.tracks.items[0].external_urls.spotify
            const trackArt = trackData.tracks.items[0].album.images[0].url
            const songData = {id: trackId, url: trackLink, art: trackArt}
            callback(songData)
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

function getSimilarSongs(trackId, callback) {
    spotify
        .request(`https://api.spotify.com/v1/recommendations?seed_tracks=${trackId}&limit=3`)
        .then(function(data) {
            response = []
            for (const track of data.tracks) {
                response.push({artist: track.artists[0].name, song: track.name})
            }
            callback(response)
        })
        .catch(function(err) {
            console.error('Error occurred: ' + err);
        });
}

module.exports.getSongData = getSongData;
module.exports.getSimilarSongs = getSimilarSongs;
module.exports.getTrack = getTrack;
