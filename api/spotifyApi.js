const Spotify = require('node-spotify-api');
const redis = require('../lib/redis')

const spotify = new Spotify({
    id: process.env.SPOTIFY_CLIENT_ID,
    secret: process.env.SPOTIFY_CLIENT_SECRET
});

function getSongData(songName, artist, callback) {
    getTrack(songName, artist, function(trackData){
        if (typeof trackData.tracks.items[0] !== 'undefined') {
            getArtist(trackData.tracks.items[0].artists[0].id, function(artistData) {
                const track = trackData.tracks.items[0]
                const trackLink = track.external_urls.spotify
                const trackArt = track.album.images[0].url
                const songData = {id: track.id, url: trackLink, art: trackArt, genres: artistData.genres, name: track.name, artist: artistData.name}
                callback(songData)
            })
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

function getArtist(artistId, callback) {
    spotify.request(`https://api.spotify.com/v1/artists/${artistId}`, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        } else {
            callback(data)
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
