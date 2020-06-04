var client = require('redis').createClient(process.env.REDIS_URL);

process.on("exit", function(){
    client.quit();
});

function setSong(sender, songName) {
    client.set(`${sender}:song`, songName, 'EX', 60 * 60 * 24, function(err) {
    if (err) {
        throw err; /* in production, handle errors more gracefully */
    } else {
        client.get(`${sender}:song`, function(err) {
            if (err) {
                throw err;
            }
        }
    );
    }});
}

function getSong(sender, callback) {
    client.get(`${sender}:song`, function(err,value) {
        if (err) {
            throw err;
        } else {
            return callback(value)
        }
    });
}

function setArtist(sender, artistName) {
    client.set(`${sender}:artist`, artistName, 'EX', 60 * 60 * 24, function(err) {
    if (err) {
        throw err; /* in production, handle errors more gracefully */
    } else {
        client.get(`${sender}:artist`, function(err) {
            if (err) {
                throw err;
            }
        }
    );
    }});
}

function getArtist(sender, callback) {
    client.get(`${sender}:artist`, function(err,value) {
        if (err) {
            throw err;
        } else {
            return callback(value)
        }
    });
}

function setSongData(songName, artistName, data) {
    client.set(`${songName}:${artistName}`, data, 'EX', 60 * 60 * 24, function(err) {
    if (err) {
        throw err; /* in production, handle errors more gracefully */
    } else {
        client.get(`${songName}:${artistName}`, function(err) {
            if (err) {
                throw err;
            }
        }
    );
    }});
}

function getSongData(songName, artistName, callback) {
    client.get(`${songName}:${artistName}`, function(err,value) {
        if (err) {
            throw err;
        } else {
            return callback(value)
        }
    });
}

function setConversationStep(sender, stepCode) {
    client.set(`${sender}:convoStep`, stepCode, 'EX', 60 * 60 * 24, function(err) {
    if (err) {
        throw err; /* in production, handle errors more gracefully */
    } else {
        client.get(`${sender}:convoStep`, function(err) {
            if (err) {
                throw err;
            }
        }
    );
    }});
}

function getConversationStep(sender, callback) {
    client.get(`${sender}:convoStep`, function(err,value) {
        if (err) {
            throw err;
        } else {
            if (value == null) {
                value = "SS0"
            }
            return callback(value)
        }
    });
}

function setRecommendedSong(sender, recommendPayload) {
    client.set(`${sender}:rec`, recommendPayload, 'EX', 60 * 60 * 24, function(err) {
    if (err) {
        throw err;
    } else {
        client.get(`${sender}:rec`, function(err) {
            if (err) {
                throw err;
            }
        }
    );
    }});
}

function getRecommendedSong(sender, callback) {
    client.get(`${sender}:rec`, function(err,value) {
        if (err) {
            throw err;
        } else {
            return callback(value)
        }
    });
}

module.exports.setSong = setSong;
module.exports.getSong = getSong;
module.exports.setArtist = setArtist;
module.exports.getArtist = getArtist;
module.exports.setSongData = setSongData;
module.exports.getSongData = getSongData;
module.exports.setConversationStep = setConversationStep;
module.exports.getConversationStep = getConversationStep;
module.exports.setRecommendedSong = setRecommendedSong;
module.exports.getRecommendedSong = getRecommendedSong;
