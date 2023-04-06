const {spotchannel,
  spotifyID,
  spotifySecret,
  spotifyRefresh,
  steamedcatsID} = process.env;
const SpotifyWebApi = require('spotify-web-api-node');


const spotifyApi = new SpotifyWebApi({
  clientId: spotifyID,
  clientSecret: spotifySecret,
  refreshToken: spotifyRefresh,
});

/**
     * Grabs the song ID from Spotify URLs
     * @param {string} input The Spotify Track URL
     * @return {string} the Spotify track ID
     */
function useRegex(input) {
  const regex = /(?<=track\/)[^?\n]+/i;
  return input.match(regex);
}


module.exports = {
  /**
      * Takes care of Spotify authorization.
      */
  spotifyToken: async function() {
    spotifyApi.refreshAccessToken().then(
        function(data) {
          console.log('Initial access token has been set');
          spotifyApi.setAccessToken(data.body['access_token']);
        },
        function(err) {
          console.log('Could not set access token', err);
        },
    );
    setInterval(async () => {
      spotifyApi.refreshAccessToken().then(
          function(data) {
            console.log('The access token has been refreshed!');
            spotifyApi.setAccessToken(data.body['access_token']);
          },
          function(err) {
            console.log('Could not refresh access token', err);
          },
      );
    }, 3500000);
  },
  /**
      * Spotbot functionality
      * @param {Object} msg The message that triggered the function.
      */
  spotifyBot: async function(msg) {
    // Check if message was sent in specific channel
    if (msg.channelId == spotchannel ) {
      // Check if the message was sent by a Bot
      if (!msg.author.bot) {
        // Check if the message contains a Spotify link
        if (msg.content.includes('https://open.spotify.com/track/')) {
          // Extract the Spotify URI/ID so we can use it.
          const URIID = useRegex(msg.content);
          /* Remove all occurrence of a track to prevent duplicates.
              Pretty lazy, but it works. */
          const tracks = [{uri: `spotify:track:${URIID}`}];
          await spotifyApi.removeTracksFromPlaylist(steamedcatsID, tracks)
              .then(function(data) {
                console.log('Tracks removed from playlist!');
              }, function(err) {
                console.log('Deleting tracks failed', err);
              });
          // Add the track
          await spotifyApi.addTracksToPlaylist(steamedcatsID,
              [`spotify:track:${URIID}`])
              .then(function(data) {
                console.log('Added tracks to playlist!');
                /* Just to let the people know that we managed
                    to add the spotify track */
                msg.react(`👀`);
              }, function(err) {
                console.log('Adding tracks failed!', err);
              });
        }
      }
    }
  },
};

