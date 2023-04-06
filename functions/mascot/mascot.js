/**
 * Mascot Bot
 */

const {globalInterval,
  dropboxRefresh,
  dropboxClientId,
  dropboxClientSecret,
  mascotchannelId,
  dropboxFolder,
  danId} = process.env;

const {Dropbox} = require(`dropbox`); // eslint-disable-line no-unused-vars

const dropboxConfig = {
  refreshToken: dropboxRefresh,
  clientId: dropboxClientId,
  clientSecret: dropboxClientSecret,
};

const dbx = new Dropbox(dropboxConfig);

module.exports = {
  masBot: async function(client) {
    setInterval(async () => {
      // Fetch channels and save them in a const
      const Mascot = await client.channels.fetch(mascotchannelId).catch();
      const Dan = await client.users.fetch(danId).catch();
      // Make sure they were fetched properly and continue
      if (Mascot) {
        dbx.filesListFolder({path: dropboxFolder})
            .then((fileList) => {
              const fileName = fileList.result.entries[0].name;
              const filePath = fileList.result.entries[0].path_lower;
              if (fileName && filePath) {
                dbx.filesGetTemporaryLink({path: filePath})
                    .then((fileLink) => {
                      const Link = fileLink.result.link;
                      const mascotMessage = Mascot.send({
                        files: [{
                          attachment: Link,
                          name: fileName,
                        }],
                      }).catch((err) => {
                        console.error(err);
                      });
                      if (mascotMessage) {
                        dbx.filesDeleteV2({path: filePath})
                            .then((response) => {
                              console.log('Succesfully deleted file: ' +
                                response.result.metadata.path_display);
                            })
                            .catch((err) => {
                              console.error(err);
                            });
                      }
                    })
                    .catch((err) => {
                      console.error(err);
                    });
              }
            })
            .catch((err) => {
              console.error(err);
              Mascot.send({
                content: `${Dan} Man what the fuck there are no images left.`,
              });
            });
      } else {
        console.log('Couldn\'t find that channel man, shit sucks big time.');
      }
    }, globalInterval);
  },
};
