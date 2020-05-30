const Spotify = require('node-spotify-api');

const spotify = new Spotify({
    id: process.env.SPOTIFY_CLIENT_ID,
    secret: process.env.SPOTIFY_CLIENT_SECRET
});

function getTrack(songName, artist) {
    spotify.search({ type: 'track', query: `${songName} ${artist}` }, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        console.log(data);
    });
}

module.exports.getTrack = getTrack;
